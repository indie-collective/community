// Site-wide reads (#151): search across everything, the sitemap, and the
// health check.
import { isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, organizations } from '../db/schema.js';
import { listEventCards } from './events.server';
import { listGameCards } from './games.server';
import { listOrganizationCards } from './organizations.server';
import { SEARCH_KINDS, searchIndex } from './search.server';

/**
 * Site search (#306): games, studios, associations and events matching `q`,
 * best first, as cards, each with `search_match` (why it matched, see
 * data/search). Every kind, or only `kind`; `limit` per kind, from
 * `offset`. Null for an empty query.
 *
 * @returns {Promise<{ counts: object, results: object } | null>} counts
 *   and results by kind (`game`, `studio`, `association`, `event`)
 */
export async function searchSite(
  q,
  { kind = null, limit = 6, offset = 0 } = {}
) {
  const kinds = kind ? [kind] : SEARCH_KINDS;
  const found = await searchIndex(q, { kinds, limit, offset, perKind: true });
  if (!found) return null;

  const ids = (...of) =>
    found.hits.filter((hit) => of.includes(hit.kind)).map((hit) => hit.id);
  const [games, orgs, events] = await Promise.all([
    listGameCards(ids('game')),
    listOrganizationCards(ids('studio', 'association')),
    listEventCards(ids('event')),
  ]);
  const cards = new Map(
    [...games, ...orgs, ...events].map((card) => [card.id, card])
  );

  const results = Object.fromEntries(kinds.map((k) => [k, []]));
  for (const hit of found.hits) {
    const card = cards.get(hit.id);
    if (card) results[hit.kind].push({ ...card, search_match: hit.match });
  }
  return { counts: found.counts, results };
}

/**
 * What the sitemap lists: games, organisations and events (deleted ones
 * left out), each `{ id, updated_at }`.
 */
export async function listSitemapRecords() {
  const list = (table) =>
    db
      .select({ id: table.id, slug: table.slug, updated_at: table.updatedAt })
      .from(table)
      .where(isNull(table.deletedAt));
  const [gameRows, orgs, eventRows] = await Promise.all([
    list(games),
    list(organizations),
    list(events),
  ]);
  return { games: gameRows, orgs, events: eventRows };
}

/** Rejects when the database can't be queried. */
export async function checkDatabase() {
  await db.run(sql`select 1`);
}
