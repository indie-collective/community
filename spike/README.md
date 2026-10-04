# Workers spike (throwaway)

Measures whether the app fits Cloudflare Workers' free plan (ADR 0002, #253).
Not for merging.

- `../vite.config.js`, `../workers/app.js`, `../wrangler.jsonc`: the app built for Workers.
  The Prisma 4 client and the Node-only libraries that the migration replaces
  are stubbed (`db-stub.js`, `lib-stub.js`).
- `db-stub.js` replays query results recorded from a local copy of production
  (`fixtures.json`, git-ignored, made with `record.mjs`), so pages render real data.
- `orm-prisma/`, `orm-drizzle/`: minimal Workers running the game page's queries
  with Prisma 7 + D1 adapter and with Drizzle, for size and time.
- `node-cpu.mjs`: main-thread busy time per page on Node, split into data and render.
