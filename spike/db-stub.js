// Spike only: stands in for the Prisma 4 client, which can't run on
// Workers. It replays query results recorded from a local copy of
// production (spike/fixtures.json), so pages render real data and the
// Worker's CPU time per page can be measured on Cloudflare.
import fixtures from './fixtures.json';

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
const revive = (value) =>
  JSON.parse(JSON.stringify(value), (k, v) => (typeof v === 'string' && ISO.test(v) ? new Date(v) : v));

const stableKey = (model, action, args) =>
  JSON.stringify([model ?? null, action, args ?? null], (k, v) =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? '<date>' : v
  );

const raw = Object.entries(fixtures)
  .map(([key, result]) => [JSON.parse(key), result])
  .filter(([[, action]]) => action === 'queryRaw');

function lookup(model, action, args) {
  const key = stableKey(model, action, args);
  if (key in fixtures) return revive(fixtures[key]);
  console.log('spike: no fixture for', key.slice(0, 160));
  return action === 'findMany' || action === 'groupBy' ? [] : action === 'count' ? 0 : null;
}

const model = (name) =>
  new Proxy({}, { get: (_, action) => async (args) => lookup(name, action, args) });

export const db = new Proxy(
  {},
  {
    get(_, prop) {
      if (prop === '$queryRaw')
        return async (strings) => {
          const match = raw.find(([[, , args]]) => JSON.stringify(args[0]) === JSON.stringify(Array.from(strings)));
          return match ? revive(match[1]) : [];
        };
      if (prop === '$transaction') return (ops) => Promise.all(ops);
      if (prop === 'then') return undefined;
      return model(prop);
    },
  }
);
