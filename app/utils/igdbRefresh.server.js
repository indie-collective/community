/**
 * The scheduled IGDB refresh (#254), run by the Worker's Cron Trigger (see
 * workers/app.js): game pages refresh their own IGDB data after the
 * response; this catches the games nobody visits.
 *
 * - Refreshes at most `limit` games: those never fetched first, then the
 *   oldest. Games whose data is under a day old are skipped.
 * - Skips games whose refresh started in the last 10 minutes (a page view's).
 * - Paces requests (~3 per second) to stay inside IGDB's 4 per second.
 */
import { listLinkedGames } from '../data/igdb.server.js';
import { isStale, refreshIGDBData } from './igdbData.server.js';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function refreshStalestIGDBData({ limit = 20 } = {}) {
  const games = await listLinkedGames();
  const stalest = games
    .filter((game) => isStale(game))
    .sort(
      (a, b) =>
        (a.igdb?.fetched_at?.getTime() ?? 0) -
        (b.igdb?.fetched_at?.getTime() ?? 0)
    )
    .slice(0, limit);

  console.log(`${stalest.length} of ${games.length} linked games to refresh.`);
  for (const game of stalest) {
    try {
      const refreshed = await refreshIGDBData(game);
      console.log(
        `${refreshed ? 'refreshed' : 'skipped (refresh running)'}: ${game.name} (${game.igdb_slug})`
      );
    } catch (error) {
      console.error(
        `failed: ${game.name} (${game.igdb_slug}): ${error.message}`
      );
    }
    await pause(350);
  }
}
