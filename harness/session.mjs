// Session-handling checks for #147, on both versions.
//
//   node --env-file=<app .env> session.mjs            all checks
//   node --env-file=<app .env> session.mjs save       save signed-in cookies to out/session-state/
//   node --env-file=<app .env> session.mjs restored   after restarting both servers, reuse them
//
// Some checks need a session for a user the form strategy cannot produce
// (no email, or deleted). Both versions sign cookies with the same local
// secret, so the script mints those cookies itself, exactly as the apps do.
import { createHmac, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import { chromium } from 'playwright';

const VERSIONS = {
  v2: process.env.V2_URL ?? 'http://localhost:3002',
  v3: process.env.V3_URL ?? 'http://localhost:3003',
};
const MEMBER = 'harness-member@indieco.test';
// Local signing secrets. main reads SESSION_SECRET and falls back to a
// dev-only value (#164); migration/chakra-v3 still hardcodes 's3cr3t'.
const SECRETS = {
  v2: process.env.HARNESS_V2_SECRET ?? 'dev-only-session-secret',
  v3: process.env.HARNESS_V3_SECRET ?? 's3cr3t',
};

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const q = async (sql, params = []) => (await db.query(sql, params)).rows;

// Same encoding and signature as createCookieSessionStorage in Remix v1 and RR7.
function mintSession(v, data) {
  const value = Buffer.from(encodeURIComponent(JSON.stringify(data)).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))), 'latin1').toString('base64');
  const sig = createHmac('sha256', SECRETS[v]).update(value).digest('base64').replace(/=+$/, '');
  return `_session=${encodeURIComponent(`${value}.${sig}`)}`;
}

const get = (base, path, cookie) =>
  fetch(base + path, { redirect: 'manual', headers: cookie ? { cookie } : {} });

const signIn = async (base, email) => {
  const res = await fetch(`${base}/signin`, {
    method: 'POST',
    redirect: 'manual',
    body: new URLSearchParams({ email, password: 'unused' }),
  });
  const setCookie = res.headers.get('set-cookie') ?? '';
  return { res, setCookie, cookie: setCookie.split(';')[0] };
};

const loc = (res) => res.headers.get('location') ?? '';
const results = [];
const record = (check, v, ok, detail) => {
  results.push({ check, version: v, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${v} ${check}: ${detail}`);
};

const mode = process.argv[2];
const stateDir = new URL('./out/session-state/', import.meta.url).pathname;

if (mode === 'save' || mode === 'restored') {
  mkdirSync(stateDir, { recursive: true });
  for (const [v, base] of Object.entries(VERSIONS)) {
    if (mode === 'save') {
      const { cookie } = await signIn(base, MEMBER);
      writeFileSync(`${stateDir}${v}.cookie`, cookie);
      record('save-cookie', v, !!cookie, 'signed in, cookie saved');
    } else {
      const cookie = readFileSync(`${stateDir}${v}.cookie`, 'utf8');
      const res = await get(base, '/profile', cookie);
      record('survives-server-restart', v, res.status === 200, `/profile with pre-restart cookie → ${res.status} ${loc(res)}`);
    }
  }
  await db.end();
  process.exit(0);
}

const PROTECTED = [
  '/profile', '/profile/edit', '/welcome', '/games/create', '/events/create', '/orgs/create',
  '/admin/users', '/admin/tags', '/admin/changes', '/admin/missing',
];
const [game] = await q('select id from game where not coalesce(deleted, false) limit 1');
const [event] = await q('select id from event limit 1');
const [org] = await q("select id from entity where type = 'studio' limit 1");
PROTECTED.push(`/game/${game.id}/edit`, `/event/${event.id}/edit`, `/org/${org.id}/edit`, `/game/${game.id}/changes`);

const browser = await chromium.launch();

for (const [v, base] of Object.entries(VERSIONS)) {
  // Cookie attributes
  const { res: signinRes, setCookie, cookie } = await signIn(base, MEMBER);
  const attrs = setCookie.split(';').slice(1).map((s) => s.trim()).join('; ');
  record('cookie-attributes', v, /HttpOnly/i.test(setCookie) && /SameSite=Lax/i.test(setCookie), `${signinRes.status} → ${loc(signinRes)}; ${attrs}`);

  // Persistence across navigations and a full reload, in a real browser
  const ctx = await browser.newContext({ baseURL: base });
  const [name, val] = cookie.split(/=(.*)/s);
  await ctx.addCookies([{ name, value: val, url: base }]);
  const page = await ctx.newPage();
  const seen = [];
  for (const path of ['/', '/games', '/events', '/profile', '/about']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    seen.push(`${path}:${(await page.locator('body').innerText()).includes('@harness-member') ? 'in' : 'OUT'}`);
  }
  await page.reload({ waitUntil: 'networkidle' });
  seen.push(`reload:${(await page.locator('body').innerText()).includes('@harness-member') ? 'in' : 'OUT'}`);
  record('persists-across-navigation-and-reload', v, !seen.some((s) => s.endsWith('OUT')), seen.join(' '));
  await ctx.close();

  // Protected routes while logged out
  const outcomes = [];
  for (const path of PROTECTED) {
    const res = await get(base, path);
    outcomes.push(`${path.replace(/[0-9a-f-]{36}/, ':id')} ${res.status}${loc(res) ? `→${loc(res)}` : ''}`);
  }
  const leaked = outcomes.filter((o) => / 200/.test(o));
  record('protected-routes-logged-out', v, leaked.length === 0, outcomes.join(' | '));

  // Redirect after login: does signing in return to the page that asked for it?
  const bounce = await get(base, '/profile');
  const signinUrl = loc(bounce);
  const afterLogin = await fetch(new URL(signinUrl || '/signin', base), {
    method: 'POST',
    redirect: 'manual',
    body: new URLSearchParams({ email: MEMBER, password: 'unused' }),
  });
  record('return-to-intended-page', v, loc(afterLogin) === '/profile', `/profile → ${signinUrl}; after sign-in → ${loc(afterLogin)}`);

  // Logout clears the session; replaying the old cookie afterwards
  const logout = await fetch(`${base}/logout`, { method: 'POST', redirect: 'manual', headers: { cookie } });
  const logoutCookie = logout.headers.get('set-cookie') ?? '';
  const replay = await get(base, '/profile', cookie);
  record('logout-clears-cookie', v, /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(logoutCookie), `${logout.status} → ${loc(logout)}; Set-Cookie ${logoutCookie.split(';').slice(1, 3).join(';').trim() || '(none)'}`);
  record('old-cookie-after-logout', v, true, `replayed pre-logout cookie → /profile ${replay.status} (stateless cookie sessions stay valid until expiry on both — informational)`);

  // Minted cookies are only meaningful if the app accepts them.
  const [member] = await q('select id, username, first_name, email, "isAdmin" from person where email = $1', [MEMBER]);
  const minted = await get(base, '/profile', mintSession(v, { user: member, strategy: 'user-pass' }));
  record('minted-cookie-accepted', v, minted.status === 200, `/profile with minted member cookie → ${minted.status}`);

  // A user with no email: must go through /welcome, and /welcome must let them out
  const [noEmail] = await q(`insert into person (username, first_name) values ($1, $2) returning id, username, first_name, email, "isAdmin"`, [`harness-noemail-${v}`, `harness-noemail-${v}`]);
  const noEmailCookie = mintSession(v, { user: noEmail, strategy: 'user-pass' });
  const gate = await get(base, '/games', noEmailCookie);
  const post = await fetch(`${base}/welcome`, {
    method: 'POST',
    redirect: 'manual',
    headers: { cookie: noEmailCookie },
    body: new URLSearchParams({ email: `harness-noemail-${v}@indieco.test` }),
  });
  const postCookie = post.headers.get('set-cookie');
  const nextCookie = postCookie ? postCookie.split(';')[0] : noEmailCookie;
  const after = await get(base, '/games', nextCookie);
  const [dbRow] = await q('select email from person where id = $1', [noEmail.id]);
  record(
    'welcome-lets-new-user-out',
    v,
    loc(after) !== '/welcome' && after.status === 200,
    `before: /games ${gate.status}→${loc(gate)}; POST /welcome ${post.status}, Set-Cookie ${postCookie ? 'sent' : 'MISSING'}; db email ${dbRow.email ? 'saved' : 'not saved'}; after: /games ${after.status}${loc(after) ? `→${loc(after)}` : ''}`
  );
  await q('delete from person where id = $1', [noEmail.id]);

  // A session whose user no longer exists in the database
  const ghost = mintSession(v, { user: { id: randomUUID(), username: 'ghost', first_name: 'Ghost', email: 'ghost@indieco.test' }, strategy: 'user-pass' });
  const ghostHome = await get(base, '/', ghost);
  const ghostProfile = await get(base, '/profile', ghost);
  record('deleted-user-session', v, ghostProfile.status !== 200, `/ → ${ghostHome.status}${loc(ghostHome) ? `→${loc(ghostHome)}` : ''}; /profile → ${ghostProfile.status}${loc(ghostProfile) ? `→${loc(ghostProfile)}` : ''}`);

  // Discord OAuth: only the hand-off to Discord and a bogus callback.
  const oauth = await fetch(`${base}/auth/discord`, { method: 'POST', redirect: 'manual' });
  const target = loc(oauth);
  let summary = `${oauth.status}`;
  if (target.startsWith('https://discord.com')) {
    const u = new URL(target);
    summary += ` → discord.com${u.pathname}; redirect_uri=${u.searchParams.get('redirect_uri')}; scope=${u.searchParams.get('scope')}; client_id ${u.searchParams.get('client_id') ? 'set' : 'MISSING'}; state ${u.searchParams.get('state') ? 'set' : 'MISSING'}`;
  } else summary += ` → ${target || '(no redirect)'}`;
  const callback = await get(base, '/auth/discord/callback?code=bogus&state=bogus');
  record('discord-oauth-handoff', v, target.startsWith('https://discord.com'), `${summary}; bogus callback → ${callback.status}${loc(callback) ? `→${loc(callback)}` : ''}`);
  const steam = await fetch(`${base}/auth/steam`, { method: 'POST', redirect: 'manual' });
  record('steam-oauth', v, true, `POST /auth/steam → ${steam.status}${loc(steam) ? `→${loc(steam)}` : ''} (informational)`);
}

await browser.close();
await q(`delete from person where username like 'harness-noemail-%'`);
await db.end();

const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
mkdirSync(new URL('./out/', import.meta.url).pathname, { recursive: true });
writeFileSync(new URL(`./out/session-${run}.json`, import.meta.url), JSON.stringify(results, null, 2) + '\n');
