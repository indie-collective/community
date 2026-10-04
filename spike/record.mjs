import { createRequestHandler } from 'react-router';
import fs from 'node:fs';
const build = await import('./build/server/index.js');
const handler = createRequestHandler(build, 'production');
const paths = JSON.parse(process.argv[2]);
for (const p of paths) {
  const res = await handler(new Request('http://localhost' + p));
  await res.text();
  if (res.status !== 200) console.log('status', res.status, p);
}
const rec = globalThis.__recorded;
fs.writeFileSync('fixtures.json', JSON.stringify(rec));
console.log(Object.keys(rec).length, 'queries,', (fs.statSync('fixtures.json').size / 1024).toFixed(0), 'KB');
for (const k of Object.keys(rec)) if (k.includes('queryRaw')) console.log(k.slice(0, 200));
process.exit(0);
