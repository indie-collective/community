// Readable URLs (#209): each game, organisation and event has a slug made
// from its name, unique per kind. Renaming gives a new slug and keeps the
// old one as an alias, so old links still lead to the record.
import { and, eq, like, or } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, organizations, slugAliases } from '../db/schema.js';
import { firstFreeSlug, isUuid } from '../utils/slug';

const TABLES = { game: games, organization: organizations, event: events };

/**
 * A free slug for a record of `kind` from `base` (a slugified name):
 * `base`, or `base-2`, `base-3`… when taken by another record or alias.
 */
export async function freeSlug(kind, base, { recordId = null } = {}) {
  const table = TABLES[kind];
  const pattern = `${base}%`;
  const [records, aliases] = await Promise.all([
    db
      .select({ slug: table.slug, id: table.id })
      .from(table)
      .where(or(eq(table.slug, base), like(table.slug, pattern))),
    db
      .select({ slug: slugAliases.slug, id: slugAliases.recordId })
      .from(slugAliases)
      .where(and(eq(slugAliases.kind, kind), like(slugAliases.slug, pattern))),
  ]);
  // A record's own slugs, current or old, are free for it.
  const taken = new Set(
    [...records, ...aliases].filter((row) => row.id !== recordId).map((row) => row.slug)
  );
  return firstFreeSlug(base, taken);
}

/**
 * The statements renaming a record's slug, for the same batch as its
 * update: the new slug, and the old one kept as an alias. None when the
 * slug doesn't change.
 */
export function renameSlugStatements(kind, recordId, oldSlug, newSlug) {
  if (!newSlug || newSlug === oldSlug) return [];
  const table = TABLES[kind];
  return [
    db.update(table).set({ slug: newSlug }).where(eq(table.id, recordId)),
    // The new slug may have been this record's before: it's current again.
    db
      .delete(slugAliases)
      .where(and(eq(slugAliases.kind, kind), eq(slugAliases.slug, newSlug))),
    ...(oldSlug
      ? [
          db
            .insert(slugAliases)
            .values({ kind, slug: oldSlug, recordId })
            .onConflictDoNothing(),
        ]
      : []),
  ];
}

/**
 * The record a URL segment points to: by UUID, current slug, or old slug.
 * `{ id, slug }` (the current slug, null until backfilled), or null. A
 * record merged into another (#346) leads to that one: its slug and ID are
 * aliases of it.
 */
export async function findBySlugOrId(kind, value) {
  const table = TABLES[kind];
  const [row] = await db
    .select({ id: table.id, slug: table.slug, deletedAt: table.deletedAt })
    .from(table)
    .where(isUuid(value) ? eq(table.id, value) : eq(table.slug, value));
  if (row && !row.deletedAt) return { id: row.id, slug: row.slug };
  const [alias] = await db
    .select({ id: table.id, slug: table.slug })
    .from(slugAliases)
    .innerJoin(table, eq(table.id, slugAliases.recordId))
    .where(and(eq(slugAliases.kind, kind), eq(slugAliases.slug, value)));
  if (alias) return alias;
  // Deleted, not merged: its pages say it's gone.
  return row ? { id: row.id, slug: row.slug } : null;
}
