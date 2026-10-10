// Site-wide reads (#151): search across everything, the sitemap, and the
// health check.
import { and, isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, organizations } from '../db/schema.js';
import { matchesSearch } from '../db/search.js';
import * as shape from './shapes.server';

/**
 * Games, organisations and events whose name or description matches `q`;
 * null for an empty query. Events come with attendance and games (deleted
 * ones left out).
 */
export async function searchSite(q) {
  const where = (table) => {
    const search = matchesSearch(table.searchText, q);
    return search && and(search, isNull(table.deletedAt));
  };
  if (!where(games)) return null;
  const [gameRows, orgRows, eventRows] = await Promise.all([
    db.select().from(games).where(where(games)),
    db.select().from(organizations).where(where(organizations)),
    db.query.events.findMany({
      where: where(events),
      with: {
        participants: true,
        games: { with: { game: { columns: { deletedAt: true } } } },
      },
    }),
  ]);
  return {
    games: gameRows.map(shape.game),
    orgs: orgRows.map(shape.organization),
    events: eventRows.map((row) => ({
      ...shape.event(row),
      event_participant: row.participants.map(({ eventId, personId }) => ({
        event_id: eventId,
        person_id: personId,
      })),
      game_event: row.games
        .filter(({ game }) => game && !game.deletedAt)
        .map(({ gameId, eventId }) => ({ game_id: gameId, event_id: eventId })),
    })),
  };
}

/**
 * What the sitemap lists: games, organisations and events (deleted ones
 * left out), each `{ id, updated_at }`.
 */
export async function listSitemapRecords() {
  const list = (table) =>
    db
      .select({ id: table.id, updated_at: table.updatedAt })
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
