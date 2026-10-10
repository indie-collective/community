// Stored IGDB data (#151, part 2; #254): the claims and results of
// refreshes. Imported with extensions so Node scripts can load it.
import { Prisma } from '@prisma/client';

import { db } from '../utils/db.server.js';

/**
 * Marks a refresh of a game's IGDB data as started, unless one started
 * less than `guardMs` before `now`. True when this caller got to start it:
 * of concurrent callers, only one does.
 */
export async function claimIGDBRefresh(gameId, slug, { now, guardMs }) {
  const { count } = await db.game_igdb.updateMany({
    where: {
      game_id: gameId,
      OR: [
        { refresh_started_at: null },
        { refresh_started_at: { lt: new Date(now.getTime() - guardMs) } },
      ],
    },
    data: { refresh_started_at: now },
  });
  if (count === 1) return true;

  // No row yet: the first to create it gets the refresh.
  try {
    await db.game_igdb.create({
      data: { game_id: gameId, slug, refresh_started_at: now },
    });
    return true;
  } catch (error) {
    if (error?.code === 'P2002') return false; // It exists: someone else's refresh is running.
    throw error;
  }
}

/**
 * Stores what IGDB returned for a slug (null when it has no such game), and
 * clears the refresh's claim.
 */
export async function saveIGDBData(gameId, slug, data) {
  await db.game_igdb.update({
    where: { game_id: gameId },
    // A SQL NULL when IGDB has no game with this slug.
    data: {
      slug,
      data: data ?? Prisma.DbNull,
      fetched_at: new Date(),
      refresh_started_at: null,
    },
  });
}

/**
 * Games linked to IGDB, deleted ones left out, for the scheduled refresh:
 * `{ id, name, igdb_slug, igdb }`.
 */
export function listLinkedGames() {
  return db.game.findMany({
    where: { deleted: false, igdb_slug: { not: null } },
    select: { id: true, name: true, igdb_slug: true, igdb: true },
  });
}
