// The database for Node scripts and tests: the local D1 (SQLite in
// workerd) through wrangler's platform proxy, the same one `wrangler d1
// migrations apply --local` and the dev server use. D1_PERSIST_PATH picks
// another local database, as the end-to-end tests do. The app itself uses
// app/db/index.server.js.
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './schema.js';

async function localPlatform() {
  const { getPlatformProxy } = await import('wrangler');
  return getPlatformProxy({
    persist: { path: process.env.D1_PERSIST_PATH || '.wrangler/state/v3' },
  });
}

// One proxy per process, also across dev server reloads.
globalThis.__localPlatform ??= localPlatform();
const platform = await globalThis.__localPlatform;

export const db = drizzle(platform.env.DB, { schema });

/** Stops the local D1, so scripts can exit. */
export async function closeDb() {
  await platform.dispose();
  globalThis.__localPlatform = undefined;
}
