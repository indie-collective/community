// The database (#151, ADR 0003): D1 through Drizzle.
//
// Until the app runs on Workers, it runs on Node, and the D1 binding comes
// from wrangler's platform proxy: a local D1 (SQLite in workerd), the same
// one `wrangler d1 migrations apply --local` sets up. D1_PERSIST_PATH picks
// another local database, as the end-to-end tests do.
//
// Imported with extensions so Node scripts can load it.
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
