import { createRequestHandler } from 'react-router';
import { performance } from 'node:perf_hooks';
const build = await import('./build/server/index.js');
const handler = createRequestHandler(build, 'production');
const pagePaths = ['/', '/games', '/games?q=rogue', '/studios', '/associations', '/events', '/places', '/countries', '/country/fr', '/search?q=game', '/game/b7e4bfe2-aba3-49b1-add6-cdf5959bed1e', '/org/60637ecf-54ba-495b-8194-0d77baad23eb', '/event/c0148eff-8371-4774-a093-092be00ededc', '/about'];
const paths = pagePaths.flatMap((p) => { const [a, q] = p.split('?'); return [p, (a === '/' ? '/_root' : a) + '.data' + (q ? '?' + q : '')]; });
async function once(p) {
  const before = performance.eventLoopUtilization();
  const res = await handler(new Request('http://localhost' + p));
  const body = await res.text();
  const elu = performance.eventLoopUtilization(before);
  return { status: res.status, cpu: elu.active, kb: body.length / 1024 };
}
for (const p of paths) for (let i = 0; i < 3; i++) await once(p); // warm up
console.log('page                    status   busy ms (median of 15)   HTML KB');
for (const p of paths) {
  const runs = [];
  for (let i = 0; i < 15; i++) runs.push(await once(p));
  runs.sort((a, b) => a.cpu - b.cpu);
  const m = runs[7];
  console.log(p.replace(/[0-9a-f-]{36}/, ':id').padEnd(24), String(m.status).padEnd(8), m.cpu.toFixed(1).padStart(8), '      ', m.kb.toFixed(0).padStart(6));
}
process.exit(0);
