import { unstable_startWorker } from '/Users/it/Code/IndieCo/community/.claude/worktrees/mattpocock-skills-setup-716bbe/node_modules/wrangler/wrangler-dist/cli.js';
process.chdir('/Users/it/Code/IndieCo/community/.claude/worktrees/mattpocock-skills-setup-716bbe');
const worker = await unstable_startWorker({ config: 'build/server/wrangler.json', dev: { server: { port: 0 }, inspector: false, logLevel: 'log' } });
await worker.ready;
const paths = JSON.parse(process.argv[2]);
for (const p of paths) {
  const res = await worker.fetch('http://localhost' + p); if (res.status >= 500) { console.log('BODY', (await res.clone().text()).slice(0, 1500)); }
  const body = await res.text();
  const title = body.match(/<title>([^<]*)/)?.[1];
  console.log(res.status, (body.length / 1024).toFixed(0).padStart(5), 'KB', p.replace(/[0-9a-f-]{36}/, ':id'), '|', title);
}
await worker.dispose();
