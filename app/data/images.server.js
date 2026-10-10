// Uploaded images (#151). An upload is kept for a day under a new ID until
// a form attaches it; then its key and size are copied into the game's,
// organisation's, event's or person's columns (ADR 0003).
import { inArray } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { kv } from '../db/schema.js';

const PREFIX = 'upload:';
const KEEP_MS = 24 * 60 * 60 * 1000;

/**
 * Records an uploaded file (`{ name, width, height, … }` as the bucket
 * returned it).
 * @returns {Promise<string>} the ID forms send to attach it
 */
export async function createImage({ name, width, height }) {
  const id = crypto.randomUUID();
  await db.insert(kv).values({
    key: PREFIX + id,
    value: JSON.stringify({ key: name, width, height }),
    expiresAt: new Date(Date.now() + KEEP_MS),
  });
  return id;
}

/**
 * Uploads by ID, as `{ key, width, height }`, in the order asked; unknown
 * or expired IDs are left out.
 */
export async function getUploads(ids) {
  const wanted = ids.filter(Boolean);
  if (wanted.length === 0) return [];
  const rows = await db
    .select()
    .from(kv)
    .where(
      inArray(
        kv.key,
        wanted.map((id) => PREFIX + id)
      )
    );
  const now = Date.now();
  const byKey = new Map(
    rows
      .filter((row) => !row.expiresAt || row.expiresAt.getTime() > now)
      .map((row) => [row.key, JSON.parse(row.value)])
  );
  return wanted.map((id) => byKey.get(PREFIX + id)).filter(Boolean);
}

/**
 * An upload's columns for an image named `prefix` (`logo`, `cover`,
 * `avatar`): `{ logoKey, logoWidth, logoHeight }`; empty when there's no
 * such upload, so an update keeps the current image.
 */
export async function imageColumns(prefix, uploadId) {
  if (!uploadId) return {};
  const [upload] = await getUploads([uploadId]);
  if (!upload) return {};
  return {
    [`${prefix}Key`]: upload.key,
    [`${prefix}Width`]: upload.width ?? null,
    [`${prefix}Height`]: upload.height ?? null,
  };
}
