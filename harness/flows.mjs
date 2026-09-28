// Drives the authenticated flows and forms on both versions (#146) and
// checks the database where a flow should change it.
//
//   node --env-file=<app .env> flows.mjs            all flows
//   node --env-file=<app .env> flows.mjs signin     only flows whose name starts with this
//
// Writes out/flows-<run>/{flows.json,flows.md,<version>-<flow>.png}. Every
// flow records the page text that appeared after acting (errors, toasts),
// so silent failures show up as "nothing new appeared".
import { mkdirSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import { chromium } from 'playwright';

const VERSIONS = {
  v2: process.env.V2_URL ?? 'http://localhost:3002',
  v3: process.env.V3_URL ?? 'http://localhost:3003',
};
const MEMBER = 'harness-member@indieco.test';
const ADMIN = 'harness-admin@indieco.test';

// Both apps must be up before any flow writes to the database.
for (const [v, base] of Object.entries(VERSIONS)) {
  const ok = await fetch(`${base}/about`).then((r) => r.ok, () => false);
  if (!ok) {
    console.error(`${v} is not serving at ${base}; start it first (see README).`);
    process.exit(1);
  }
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const q = async (sql, params = []) => (await db.query(sql, params)).rows;

const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = new URL(`./out/flows-${run}/`, import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

async function context(baseURL, email) {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('chakra-ui-color-mode', 'light');
    localStorage.setItem('theme', 'light');
  });
  if (email) {
    const res = await ctx.request.post('/signin', { form: { email, password: 'unused' }, maxRedirects: 0 });
    if (res.status() !== 302) throw new Error(`sign-in as ${email} returned ${res.status()}`);
  }
  return ctx;
}

async function open(ctx, path) {
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text().split('\n')[0].slice(0, 200)));
  const res = await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  page.status = res?.status();
  return page;
}

const visibleLines = async (page) =>
  new Set((await page.locator('body').innerText().catch(() => '')).split('\n').map((l) => l.trim()).filter(Boolean));

// Runs act(), then returns the lines of page text that were not there before.
async function textAfter(page, act, settle = 1500) {
  const before = await visibleLines(page);
  await act();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(settle);
  const added = [...(await visibleLines(page))].filter((l) => !before.has(l));
  // Inputs with the HTML `required`/`type` attributes block submission with a
  // browser bubble that never reaches the DOM text; report those too.
  const native = await page
    .locator('input, textarea, select')
    .evaluateAll((els) => els.filter((e) => !e.validity.valid).map((e) => `native ${e.name}: ${e.validationMessage}`))
    .catch(() => []);
  return [...added, ...native].slice(0, 12);
}

// The form's own submit button, not a header button with the same label.
const submit = (page, name) =>
  page.locator('form').filter({ has: page.getByRole('button', { name, exact: true }) }).last()
    .getByRole('button', { name, exact: true }).click();

const dialogOnLoad = async (page) => {
  const open = await page.getByRole('dialog').filter({ visible: true }).count();
  if (open) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
  return open;
};

const flows = {
  async 'signin-ui'(v, base) {
    const ctx = await context(base);
    const page = await open(ctx, '/signin');
    await page.locator('input[name=email]').fill(MEMBER);
    const appeared = await textAfter(page, () => submit(page, 'Sign In'));
    const profile = await ctx.request.get('/profile', { maxRedirects: 0 });
    return { ok: profile.status() === 200, detail: `landed on ${new URL(page.url()).pathname}; /profile → ${profile.status()}`, appeared, page };
  },

  async 'signin-empty'(v, base) {
    const page = await open(await context(base), '/signin');
    const appeared = await textAfter(page, () => submit(page, 'Sign In'));
    return { ok: appeared.length > 0, detail: `still on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'signin-invalid-email'(v, base) {
    const page = await open(await context(base), '/signin');
    await page.locator('input[name=email]').fill('not-an-email');
    const appeared = await textAfter(page, () => submit(page, 'Sign In'));
    return { ok: appeared.length > 0, detail: `still on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'logout'(v, base) {
    const ctx = await context(base, MEMBER);
    const page = await open(ctx, '/profile');
    const control = page.getByRole('button', { name: /log ?out|sign ?out/i }).or(page.getByRole('link', { name: /log ?out|sign ?out/i }));
    if (!(await control.count())) return { ok: false, detail: 'no logout control on /profile', page };
    await Promise.all([page.waitForURL((u) => u.pathname !== '/profile'), control.first().click()]);
    await page.waitForLoadState('networkidle');
    const profile = await ctx.request.get('/profile', { maxRedirects: 0 });
    return { ok: profile.status() === 302, detail: `landed on ${new URL(page.url()).pathname}; /profile → ${profile.status()} ${profile.headers().location ?? ''}`, page };
  },

  async 'signup-empty'(v, base) {
    const page = await open(await context(base), '/signup');
    const appeared = await textAfter(page, () => submit(page, 'Sign Up'));
    return { ok: appeared.length > 0, detail: `still on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'signup-password-mismatch'(v, base) {
    const page = await open(await context(base), '/signup');
    await page.locator('input[name=firstName]').fill('Harness');
    await page.locator('input[name=email]').fill(`harness-signup-${v}@indieco.test`);
    await page.locator('input[name=password]').fill('first-password-1');
    await page.locator('input[name=passwordConfirmation]').fill('second-password-2');
    const appeared = await textAfter(page, () => submit(page, 'Sign Up'));
    const created = await q('select id from person where email = $1', [`harness-signup-${v}@indieco.test`]);
    await q('delete from person where email = $1', [`harness-signup-${v}@indieco.test`]);
    return { ok: appeared.length > 0 && created.length === 0, detail: `account created: ${created.length > 0}`, appeared, page };
  },

  async 'forgot-empty'(v, base) {
    const page = await open(await context(base), '/forgot');
    const appeared = await textAfter(page, () => submit(page, 'Reset password'));
    return { ok: appeared.length > 0, detail: `still on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'profile-edit'(v, base) {
    const [before] = await q('select first_name, last_name, about from person where email = $1', [MEMBER]);
    const page = await open(await context(base, MEMBER), '/profile/edit');
    if (page.status >= 400) return { ok: false, detail: `page ${page.status}`, page };
    const value = `Harness ${v} ${Date.now() % 100000}`;
    await page.locator('input[name=firstName]').fill(value);
    await page.locator('input[name=lastName]').fill('Walker');
    await page.locator('[name=about]').fill('Harness profile edit');
    const appeared = await textAfter(page, () => submit(page, 'Save'), 2500);
    const [after] = await q('select first_name from person where email = $1', [MEMBER]);
    await q('update person set first_name = $1, last_name = $2, about = $3 where email = $4', [before.first_name, before.last_name, before.about, MEMBER]);
    return { ok: after.first_name === value, detail: `db first_name ${after.first_name === value ? 'updated' : `unchanged (${after.first_name})`}; now on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'profile-edit-optional-empty'(v, base) {
    // lastName and about left null, as for any account without them.
    const page = await open(await context(base, MEMBER), '/profile/edit');
    if (page.status >= 400) return { ok: false, detail: `page ${page.status}`, page };
    const appeared = await textAfter(page, () => submit(page, 'Save'), 2500);
    return { ok: !appeared.some((l) => /must be a `string`/.test(l)), detail: `now on ${new URL(page.url()).pathname}`, appeared, page };
  },

  async 'profile-edit-username-taken'(v, base) {
    const page = await open(await context(base, MEMBER), '/profile/edit');
    if (page.status >= 400) return { ok: false, detail: `page ${page.status}`, page };
    const field = page.locator('input[name=username]');
    const appeared = await textAfter(page, async () => {
      await field.fill('harness-admin');
      await field.blur();
    }, 2500);
    return { ok: appeared.length > 0, detail: 'typed a taken username', appeared, page };
  },

  async 'welcome'(v, base) {
    const page = await open(await context(base, MEMBER), '/welcome');
    const inputs = await page.locator('input:visible').evaluateAll((els) => els.map((e) => e.name || e.type));
    return { ok: page.status === 200, detail: `status ${page.status}; inputs: ${inputs.join(', ') || 'none'}`, page };
  },

  async 'event-join-leave'(v, base) {
    const [event] = await q(`select id from event where starts_at > now() order by starts_at limit 1`);
    const [member] = await q('select id from person where email = $1', [MEMBER]);
    await q('delete from event_participant where event_id = $1 and person_id = $2', [event.id, member.id]);
    const page = await open(await context(base, MEMBER), `/event/${event.id}`);
    const dialogs = await dialogOnLoad(page);
    const join = page.getByRole('button', { name: /let's go|i went/i });
    if (!(await join.count())) return { ok: false, detail: `no join button (dialog open on load: ${dialogs})`, page };
    const appeared = await textAfter(page, () => join.first().click());
    const joined = (await q('select 1 from event_participant where event_id = $1 and person_id = $2', [event.id, member.id])).length;
    const leave = page.getByRole('button', { name: /^(going|went)$/i });
    let left = null;
    if (await leave.count()) {
      await leave.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      left = !(await q('select 1 from event_participant where event_id = $1 and person_id = $2', [event.id, member.id])).length;
    }
    await q('delete from event_participant where event_id = $1 and person_id = $2', [event.id, member.id]);
    return { ok: joined === 1 && left === true, detail: `dialog open on load: ${dialogs}; joined in db: ${joined === 1}; left in db: ${left}`, appeared, page };
  },

  async 'org-delete'(v, base) {
    const [org] = await q(`insert into entity (name, type) values ($1, 'studio') returning id`, [`Harness delete ${v}`]);
    const page = await open(await context(base, ADMIN), `/org/${org.id}`);
    const result = await deleteThroughUi(page);
    const gone = !(await q('select 1 from entity where id = $1', [org.id])).length;
    await q('delete from entity where id = $1', [org.id]);
    return { ok: gone, detail: `${result}; row deleted: ${gone}; now on ${new URL(page.url()).pathname}`, page };
  },

  async 'game-delete'(v, base) {
    const [game] = await q(`insert into game (name) values ($1) returning id`, [`Harness delete ${v}`]);
    const page = await open(await context(base, ADMIN), `/game/${game.id}`);
    const result = await deleteThroughUi(page);
    const [row] = await q('select deleted from game where id = $1', [game.id]);
    const gone = !row || row.deleted === true;
    await q('delete from game where id = $1', [game.id]);
    return { ok: gone, detail: `${result}; soft-deleted: ${gone}; now on ${new URL(page.url()).pathname}`, page };
  },

  async 'event-remove-game'(v, base) {
    const [event] = await q(`select id from event order by starts_at desc limit 1`);
    const [game] = await q(`insert into game (name) values ($1) returning id`, [`Harness link ${v}`]);
    await q('insert into game_event (game_id, event_id) values ($1, $2)', [game.id, event.id]);
    const page = await open(await context(base, MEMBER), `/event/${event.id}`);
    const dialogs = await dialogOnLoad(page);
    const remove = page.getByRole('button', { name: `Remove Harness link ${v}` });
    let detail = `dialog open on load: ${dialogs}; `;
    if (await remove.count()) {
      await remove.first().scrollIntoViewIfNeeded();
      await remove.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      detail += 'clicked remove';
    } else detail += 'no remove control';
    const linked = (await q('select 1 from game_event where game_id = $1 and event_id = $2', [game.id, event.id])).length;
    await q('delete from game_event where game_id = $1', [game.id]);
    await q('delete from game where id = $1', [game.id]);
    return { ok: linked === 0, detail: `${detail}; link removed in db: ${linked === 0}`, page };
  },

  async 'create-forms-empty-submit'(v, base) {
    const ctx = await context(base, MEMBER);
    const results = [];
    for (const path of ['/games/create', '/events/create', '/orgs/create']) {
      const page = await open(ctx, path);
      if (page.status >= 400) {
        results.push(`${path}: ${page.status}`);
        await page.close();
        continue;
      }
      const button = page.locator('button[type=submit]').last();
      const appeared = await textAfter(page, () => button.click());
      results.push(`${path}: ${appeared.length ? appeared.slice(0, 4).join(' / ') : 'nothing appeared'} (now ${new URL(page.url()).pathname})`);
      await page.close();
    }
    return { ok: results.every((r) => !/: [45]\d\d$/.test(r)), detail: results.join(' | ') };
  },

  async 'admin-pages'(v, base) {
    const ctx = await context(base, ADMIN);
    const results = [];
    for (const path of ['/admin/users', '/admin/tags', '/admin/changes', '/admin/missing']) {
      const page = await open(ctx, path);
      const buttons = await page.getByRole('button').count();
      results.push(`${path}: ${page.status}, ${buttons} buttons`);
      await page.close();
    }
    // A non-admin must not get in.
    const member = await context(base, MEMBER);
    const res = await member.request.get('/admin/users', { maxRedirects: 0 });
    results.push(`member → /admin/users: ${res.status()}`);
    return { ok: results.slice(0, 4).every((r) => r.includes(': 200')) && res.status() !== 200, detail: results.join(' | ') };
  },

  async 'admin-tag-add-delete'(v, base) {
    const name = `harness-tag-${v}`;
    await q('delete from tag where name = $1', [name]);
    const page = await open(await context(base, ADMIN), '/admin/tags');
    await page.locator('input[name=name]').fill(name);
    const appeared = await textAfter(page, () => submit(page, 'Add'));
    const added = (await q('select 1 from tag where name = $1', [name])).length === 1;
    let deleted = null;
    const row = page.getByRole('row').filter({ hasText: name });
    if (await row.count()) {
      await row.getByRole('button', { name: 'Delete' }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      deleted = (await q('select 1 from tag where name = $1', [name])).length === 0;
    }
    await q('delete from tag where name = $1', [name]);
    return { ok: added && deleted === true, detail: `added in db: ${added}; row shown: ${deleted !== null}; deleted in db: ${deleted}`, appeared, page };
  },

  async 'check-username-availability'(v, base) {
    const ctx = await context(base, MEMBER);
    const taken = await ctx.request.get('/check-username-availability?q=harness-admin');
    const free = await ctx.request.get('/check-username-availability?q=nobody-has-this-name');
    const body = async (r) => (await r.text()).slice(0, 80);
    return { ok: taken.status() === 200 && free.status() === 200, detail: `taken → ${taken.status()} ${await body(taken)} | free → ${free.status()} ${await body(free)}` };
  },
};

async function deleteThroughUi(page) {
  // Delete lives in an action menu on v2 and v3; open it, then confirm the dialog.
  const menu = page.getByRole('button', { name: /actions|more|options|menu/i });
  if (await menu.count()) {
    await menu.first().click();
    await page.waitForTimeout(700);
  }
  const item = page.getByRole('menuitem', { name: /delete/i }).or(page.getByRole('button', { name: /^delete/i }));
  if (!(await item.count())) return 'no delete control';
  await item.first().click();
  await page.waitForTimeout(500);
  const confirm = page.getByRole('dialog').getByRole('button', { name: /delete/i });
  if (!(await confirm.count())) return 'no confirm dialog';
  await confirm.first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  return 'confirmed delete';
}

const filter = process.argv[2];
const results = [];
for (const [name, flow] of Object.entries(flows)) {
  if (filter && !name.startsWith(filter)) continue;
  for (const [v, base] of Object.entries(VERSIONS)) {
    let r;
    try {
      r = await flow(v, base);
    } catch (err) {
      r = { ok: false, detail: `threw: ${err.message.split('\n')[0]}` };
    }
    if (r.page) {
      await r.page.screenshot({ path: `${outDir}${v}-${name}.png`, fullPage: true }).catch(() => {});
      r.errors = [...new Set(r.page.errors)].slice(0, 5);
      await r.page.context().close();
      delete r.page;
    }
    results.push({ flow: name, version: v, ...r });
    console.log(`${r.ok ? '✓' : '✗'} ${v} ${name}: ${r.detail}${r.appeared?.length ? `\n    appeared: ${r.appeared.join(' / ')}` : ''}`);
  }
}
// Sweep anything a flow created but could not clean up because it threw.
await q(`delete from game_event where game_id in (select id from game where name like 'Harness %')`);
await q(`delete from game where name like 'Harness %'`);
await q(`delete from entity where name like 'Harness %'`);
await q(`delete from person where email like 'harness-signup-%'`);
await browser.close();
await db.end();

writeFileSync(`${outDir}flows.json`, JSON.stringify(results, null, 2) + '\n');
const md = ['| Flow | v2 | v3 |', '|---|---|---|'];
for (const name of [...new Set(results.map((r) => r.flow))]) {
  const cell = (v) => {
    const r = results.find((x) => x.flow === name && x.version === v);
    return `${r.ok ? '✓' : '✗'} ${r.detail}${r.appeared?.length ? `<br>appeared: ${r.appeared.join(' / ')}` : ''}`.replace(/\|/g, '\\|');
  };
  md.push(`| ${name} | ${cell('v2')} | ${cell('v3')} |`);
}
writeFileSync(`${outDir}flows.md`, md.join('\n') + '\n');
console.log(`\n${outDir}flows.md`);
