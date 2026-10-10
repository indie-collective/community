// The key-value store (#151, part 2): values that must outlast a request,
// such as the IGDB access token. Imported with extensions so Node scripts
// can load it.
import { db } from '../utils/db.server.js';

/** A stored value and its expiry: `{ value, expires_at }`, or null. */
export async function getValue(key) {
  const row = await db.kv_store.findUnique({ where: { key } });
  return row ? { value: row.value, expires_at: row.expires_at } : null;
}

/** Stores a value, replacing any under the same key. */
export async function setValue(key, value, { expiresAt = null } = {}) {
  await db.kv_store.upsert({
    where: { key },
    create: { key, value, expires_at: expiresAt },
    update: { value, expires_at: expiresAt },
  });
}
