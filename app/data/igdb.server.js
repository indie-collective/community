// Stored IGDB data (#151; #254): the claims and results of refreshes.
// Imported with extensions so Node scripts can load it.
import { and, eq, isNotNull, isNull, lt, or } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { gameIgdb, games } from '../db/schema.js';
import * as shape from './shapes.server.js';

/**
 * Marks a refresh of a game's IGDB data as started, unless one started
 * less than `guardMs` before `now`. True when this caller got to start it:
 * of concurrent callers, only one does.
 */
export async function claimIGDBRefresh(gameId, slug, { now, guardMs }) {
  // One statement, so concurrent callers can't both win: it creates the
  // row, or takes over one whose refresh isn't running.
  const claimed = await db
    .insert(gameIgdb)
    .values({ gameId, slug, refreshStartedAt: now })
    .onConflictDoUpdate({
      target: gameIgdb.gameId,
      set: { refreshStartedAt: now },
      setWhere: or(
        isNull(gameIgdb.refreshStartedAt),
        lt(gameIgdb.refreshStartedAt, new Date(now.getTime() - guardMs))
      ),
    })
    .returning({ gameId: gameIgdb.gameId });
  return claimed.length === 1;
}

/**
 * Stores what IGDB returned for a slug (null when it has no such game), and
 * clears the refresh's claim.
 */
export async function saveIGDBData(gameId, slug, data) {
  await db
    .update(gameIgdb)
    .set({
      slug,
      data: data ?? null,
      fetchedAt: new Date(),
      refreshStartedAt: null,
    })
    .where(eq(gameIgdb.gameId, gameId));
}

/**
 * Games linked to IGDB, deleted ones left out, for the scheduled refresh:
 * `{ id, name, igdb_slug, igdb }`.
 */
export async function listLinkedGames() {
  const rows = await db.query.games.findMany({
    where: and(isNull(games.deletedAt), isNotNull(games.igdbSlug)),
    columns: { id: true, name: true, igdbSlug: true },
    with: { igdb: true },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    igdb_slug: row.igdbSlug,
    igdb: shape.igdb(row.igdb),
  }));
}
