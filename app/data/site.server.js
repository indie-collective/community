// Site-wide reads (#151): search across everything, the sitemap, and the
// health check.
import { isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, organizations } from '../db/schema.js';
import { listEventCards } from './events.server';
import { listGameCards } from './games.server';
import { listOrganizationCards } from './organizations.server';
import { SEARCH_KINDS, countSearch, searchIndex } from './search.server';
import { eventPath, gamePath, orgPath } from '../utils/slug';

/**
 * Site search (#306): games, studios, associations and events matching `q`,
 * best first, as cards, each with `search_match` (why it matched, see
 * data/search). Every kind, or only `kind`; `limit` per kind, from
 * `offset`. Null for an empty query.
 *
 * @returns {Promise<{ counts: object, results: object } | null>} counts
 *   of every kind, and results by kind (`game`, `studio`, `association`,
 *   `event`)
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
  // Only one kind was searched: count the others too, for the tabs.
  const counts = kind ? await countSearch(q) : found.counts;
  return { counts, results };
}

/**
 * What the search box suggests as people type (#306): the best `limit`
 * matches of any kind, as `{ kind, id, name, href, image }`, `image` a
 * thumbnail URL or null. Empty for an empty query.
 */
export async function suggestSearch(q, { limit = 6 } = {}) {
  const found = await searchIndex(q, { limit });
  if (!found) return [];
  const ids = (...of) =>
    found.hits.filter((hit) => of.includes(hit.kind)).map((hit) => hit.id);
  const [games, orgs, events] = await Promise.all([
    listGameCards(ids('game')),
    listOrganizationCards(ids('studio', 'association')),
    listEventCards(ids('event')),
  ]);
  const suggestion = {
    game: (game) => ({
      href: gamePath(game),
      image:
        game.images?.[0]?.thumbnail_url ??
        game.igdb_game?.cover?.url ??
        game.igdb_game?.screenshots?.[0]?.url ??
        null,
    }),
    studio: (org) => ({
      href: orgPath(org),
      image: org.logo?.thumbnail_url ?? null,
    }),
    association: (org) => ({
      href: orgPath(org),
      image: org.logo?.thumbnail_url ?? null,
    }),
    event: (event) => ({
      href: eventPath(event),
      image: event.cover?.thumbnail_url ?? null,
    }),
  };
  const cards = new Map(
    [...games, ...orgs, ...events].map((card) => [card.id, card])
  );
  return found.hits
    .filter((hit) => cards.has(hit.id))
    .map((hit) => {
      const card = cards.get(hit.id);
      return {
        kind: hit.kind,
        id: hit.id,
        name: card.name,
        ...suggestion[hit.kind](card),
      };
    });
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
