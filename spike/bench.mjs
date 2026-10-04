import { unstable_startWorker } from '/Users/it/Code/IndieCo/community/.claude/worktrees/mattpocock-skills-setup-716bbe/spike/orm-prisma/node_modules/wrangler/wrangler-dist/cli.js';
import path from 'node:path';
for (const name of ['prisma', 'drizzle']) {
  process.chdir(path.resolve('/Users/it/Code/IndieCo/community/.claude/worktrees/mattpocock-skills-setup-716bbe/spike/orm-' + name));
  const worker = await unstable_startWorker({ config: 'wrangler.jsonc', dev: { server: { port: 0 }, inspector: false, logLevel: 'none' } });
  await worker.ready;
  const url = 'http://x/?id=00abee6e-53c9-4fd6-becf-a694a7f84d8f';
  let first;
  for (let i = 0; i < 20; i++) { const r = await (await worker.fetch(url)).json(); first ??= r; }
  const times = [];
  for (let i = 0; i < 200; i++) { const r = await (await worker.fetch(url)).json(); times.push(r.ms); }
  times.sort((a, b) => a - b);
  console.log(name, '| first', first.ms.toFixed(1), 'ms | median', times[100].toFixed(2), 'ms | p95', times[190].toFixed(2), 'ms |', first.name, '|', first.count, 'games');
  await worker.dispose();
}
