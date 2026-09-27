// Visits every route in routes.json on both versions, in both colour modes,
// and records status, console errors, failed requests and a screenshot.
//
//   node capture.mjs                  all routes
//   node capture.mjs /games /about    only these paths (prefix match)
//
// Output: out/<run>/{results.json,summary.md,<version>/<mode>/<slug>.png}
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const VERSIONS = {
  v2: process.env.V2_URL ?? 'http://localhost:3002',
  v3: process.env.V3_URL ?? 'http://localhost:3003',
};
const MODES = ['light', 'dark'];
const ACCOUNTS = {
  member: 'harness-member@indieco.test',
  admin: 'harness-admin@indieco.test',
};

const { routes } = JSON.parse(readFileSync(new URL('./routes.json', import.meta.url)));
const filters = process.argv.slice(2);
const selected = filters.length
  ? routes.filter((r) => filters.some((f) => r.path.startsWith(f)))
  : routes;

const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = new URL(`./out/${run}/`, import.meta.url).pathname;

const slug = (path) => path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_') || 'index';

async function newContext(browser, baseURL, mode, auth) {
  const context = await browser.newContext({
    baseURL,
    colorScheme: mode,
    viewport: { width: 1280, height: 900 },
  });
  // v2 reads Chakra's storage key; v3 reads next-themes'. Setting both, plus
  // the emulated media query, puts either version in the requested mode.
  await context.addInitScript((m) => {
    localStorage.setItem('chakra-ui-color-mode', m);
    localStorage.setItem('theme', m);
  }, mode);
  if (auth !== 'none') {
    // Development-only form strategy: signs in by email alone.
    const res = await context.request.post('/signin', {
      form: { email: ACCOUNTS[auth], password: 'unused' },
      maxRedirects: 0,
    });
    if (res.status() !== 302) throw new Error(`sign-in as ${auth} on ${baseURL} returned ${res.status()}`);
  }
  return context;
}

async function capture(context, route, shotPath) {
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      consoleErrors.push(`[${msg.type()}] ${msg.text().slice(0, 500)}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message.slice(0, 500)}`));
  page.on('requestfailed', (req) =>
    failedRequests.push(`${req.failure()?.errorText} ${req.url().slice(0, 200)}`)
  );
  page.on('response', (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url().slice(0, 200)}`);
  });

  let status = null;
  let error = null;
  try {
    const res = await page.goto(route.path, { waitUntil: 'networkidle', timeout: 45_000 });
    status = res?.status() ?? null;
  } catch (err) {
    error = err.message.split('\n')[0];
  }
  // Let hydration and client effects settle before judging the page.
  await page.waitForTimeout(1000);
  const finalPath = new URL(page.url()).pathname + new URL(page.url()).search;
  try {
    await page.screenshot({ path: shotPath, fullPage: true, timeout: 20_000 });
  } catch (err) {
    error ??= `screenshot: ${err.message.split('\n')[0]}`;
  }
  await page.close();
  return { status, finalPath, error, consoleErrors, failedRequests };
}

const browser = await chromium.launch();
const results = [];

for (const [version, baseURL] of Object.entries(VERSIONS)) {
  for (const mode of MODES) {
    mkdirSync(`${outDir}${version}/${mode}`, { recursive: true });
    const contexts = {};
    for (const route of selected) {
      contexts[route.auth] ??= await newContext(browser, baseURL, mode, route.auth);
      const shot = `${version}/${mode}/${slug(route.path)}.png`;
      const result = await capture(contexts[route.auth], route, outDir + shot);
      results.push({ version, mode, ...route, ...result, screenshot: shot });
      const flag = result.error || (result.status ?? 500) >= 500 ? '✗' : result.consoleErrors.length ? '!' : '✓';
      console.log(`${flag} ${version} ${mode.padEnd(5)} ${result.status ?? '---'} ${route.path}`);
    }
    await Promise.all(Object.values(contexts).map((c) => c.close()));
  }
}
await browser.close();

writeFileSync(`${outDir}results.json`, JSON.stringify(results, null, 2) + '\n');

// Differential summary: broken on both = environment (or pre-existing),
// broken on v3 only = regression candidate.
const broken = (r) => !!r.error || r.status === null || r.status >= 500;
const lines = [
  `# Capture ${run}`,
  '',
  `v2 = ${VERSIONS.v2}, v3 = ${VERSIONS.v3}. Broken on both → environment or pre-existing; broken on v3 only → regression candidate.`,
  '',
  '| Route | Auth | Mode | v2 | v3 | v3 console/net (v2) | Verdict |',
  '|---|---|---|---|---|---|---|',
];
for (const route of selected) {
  for (const mode of MODES) {
    const [a, b] = ['v2', 'v3'].map((v) => results.find((r) => r.version === v && r.mode === mode && r.path === route.path));
    const cell = (r) => (r.error ? `error` : `${r.status}${r.finalPath !== route.path ? ` → ${r.finalPath}` : ''}`);
    const count = (r) => r.consoleErrors.length + r.failedRequests.length;
    let verdict;
    if (broken(b) && broken(a)) verdict = route.needs?.length ? `broken on both — env? (${route.needs.join(', ')})` : 'broken on both';
    else if (broken(b)) verdict = '**v3 regression**';
    else if (broken(a)) verdict = 'v3 fixed';
    else if (count(b) > count(a)) verdict = 'v3 noisier — inspect';
    else verdict = 'renders on both — compare screenshots';
    lines.push(`| \`${route.path}\` | ${route.auth} | ${mode} | ${cell(a)} | ${cell(b)} | ${count(b)} (${count(a)}) | ${verdict} |`);
  }
}
writeFileSync(`${outDir}summary.md`, lines.join('\n') + '\n');
console.log(`\n${outDir}summary.md`);
