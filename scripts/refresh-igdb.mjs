#!/usr/bin/env node
/**
 * Refresh the stalest stored IGDB data (#254).
 *
 * Game pages refresh their own IGDB data after the response; this catches
 * the games nobody visits. Run it on a schedule (a Cron Trigger once on
 * Workers, see ADR 0002).
 *
 * Usage:
 *   IGDB_CLIENT_ID=… IGDB_CLIENT_SECRET=… DATABASE_URL=… node scripts/refresh-igdb.mjs [--limit N]
 *
 * - Refreshes at most N games (default 20): those never fetched first, then
 *   the oldest. Games whose data is under a day old are skipped.
 * - Skips games whose refresh started in the last 10 minutes (a page view's).
 * - Paces requests (~3 per second) to stay inside IGDB's 4 per second.
 */
import { PrismaClient } from '@prisma/client';

import { isStale, refreshIGDBData } from '../app/utils/igdbData.server.js';

const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 20;

const db = new PrismaClient();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  const games = await db.game.findMany({
    where: { deleted: false, igdb_slug: { not: null } },
    select: { id: true, name: true, igdb_slug: true, igdb: true },
  });
  const stalest = games
    .filter((game) => isStale(game))
    .sort((a, b) => (a.igdb?.fetched_at?.getTime() ?? 0) - (b.igdb?.fetched_at?.getTime() ?? 0))
    .slice(0, limit);

  console.log(`${stalest.length} of ${games.length} linked games to refresh.`);
  let failed = 0;
  for (const game of stalest) {
    try {
      const refreshed = await refreshIGDBData(db, game);
      console.log(`${refreshed ? 'refreshed' : 'skipped (refresh running)'}: ${game.name} (${game.igdb_slug})`);
    } catch (error) {
      failed++;
      console.error(`failed: ${game.name} (${game.igdb_slug}): ${error.message}`);
    }
    await pause(350);
  }
  if (failed) process.exitCode = 1;
} finally {
  await db.$disconnect();
}
