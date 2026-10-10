// The key-value store (#151): values that must outlast a request, such as
// the IGDB access token. Imported with extensions so Node scripts can load
// it.
import { eq } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { kv } from '../db/schema.js';

/** A stored value and its expiry: `{ value, expires_at }`, or null. */
export async function getValue(key) {
  const [row] = await db.select().from(kv).where(eq(kv.key, key));
  return row ? { value: row.value, expires_at: row.expiresAt } : null;
}

/** Stores a value, replacing any under the same key. */
export async function setValue(key, value, { expiresAt = null } = {}) {
  await db
    .insert(kv)
    .values({ key, value, expiresAt })
    .onConflictDoUpdate({ target: kv.key, set: { value, expiresAt } });
}
