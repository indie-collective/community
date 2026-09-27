// Side-by-side v2 | v3 images for a capture run, one per route and mode.
//
//   node compare.mjs out/<run>              every route
//   node compare.mjs out/<run> /games       only these path prefixes
//
// Output: out/<run>/compare/<mode>/<route>.png
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const [runArg, ...filters] = process.argv.slice(2);
const runDir = resolve(runArg);
const results = JSON.parse(readFileSync(`${runDir}/results.json`));

const pairs = new Map();
for (const r of results) {
  if (filters.length && !filters.some((f) => r.path.startsWith(f))) continue;
  const key = `${r.mode}\0${r.path}`;
  pairs.set(key, { ...pairs.get(key), [r.version]: r });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 800 } });
for (const { v2, v3 } of pairs.values()) {
  if (!v2 || !v3) continue;
  const out = `${runDir}/compare/${v2.mode}/${v2.screenshot.split('/').pop()}`;
  mkdirSync(`${runDir}/compare/${v2.mode}`, { recursive: true });
  const col = (r) => `
    <div class="col">
      <h1>${r.version} · ${r.status ?? r.error} · ${r.consoleErrors.length} console · ${r.failedRequests.length} net</h1>
      <img src="../${r.screenshot}">
    </div>`;
  const html = `${runDir}/compare/.page.html`;
  writeFileSync(html, `
    <style>
      body { margin: 0; display: flex; gap: 12px; background: #888; font: 14px sans-serif; }
      .col { width: 640px; }
      h1 { font-size: 14px; margin: 4px; color: #fff; }
      img { width: 640px; display: block; }
    </style>
    ${col(v2)}${col(v3)}`);
  await page.goto(`file://${html}`);
  await page.screenshot({ path: out, fullPage: true });
}
await browser.close();
console.log(`${pairs.size} comparisons in ${runDir}/compare`);
