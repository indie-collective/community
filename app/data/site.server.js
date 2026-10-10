// Site-wide reads (#151, part 2): search across everything, the sitemap,
// totals and the health check.
import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';

/**
 * Games, organisations and events whose name matches `q`; null for an
 * empty query. Events come with attendance and games (deleted ones left
 * out).
 */
export async function searchSite(q) {
  const search = getFullTextSearchQuery(q);
  if (!search) return null;
  const [games, orgs, events] = await Promise.all([
    db.game.findMany({ where: { name: { search } } }),
    db.entity.findMany({ where: { name: { search } } }),
    db.event.findMany({
      where: { name: { search } },
      include: {
        event_participant: true,
        game_event: { where: { game: { deleted: false } } },
      },
    }),
  ]);
  return { games, orgs, events };
}

/**
 * What the sitemap lists: games (deleted ones left out), organisations and
 * events, each `{ id, updated_at }`.
 */
export async function listSitemapRecords() {
  const [games, orgs, events] = await Promise.all([
    db.game.findMany({
      where: { deleted: false },
      select: { id: true, updated_at: true },
    }),
    db.entity.findMany({ select: { id: true, updated_at: true } }),
    db.event.findMany({ select: { id: true, updated_at: true } }),
  ]);
  return { games, orgs, events };
}

/** Rejects when the database can't be queried. */
export async function checkDatabase() {
  await db.game.count();
}
