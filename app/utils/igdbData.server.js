/**
 * Stored IGDB data (#254). Pages show what's in `game_igdb` and never wait
 * for IGDB: when it's missing or older than a day, the game page refreshes
 * it after the response, and scripts/refresh-igdb.mjs refreshes the stalest
 * ones on a schedule.
 */
import { claimIGDBRefresh, saveIGDBData } from '../data/igdb.server.js';
import { fetchIGDBGame } from './igdb.server.js';

export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
// A refresh that started less than this long ago is still running (or
// failed recently): don't start another.
export const REFRESH_GUARD_MS = 10 * 60 * 1000;

/**
 * The stored IGDB game for a game loaded with `include: { igdb: true }`, or
 * undefined. Data fetched for an older slug is never shown.
 */
export function storedIGDBGame(game) {
  const stored = game?.igdb;
  if (!game?.igdb_slug || !stored?.data || stored.slug !== game.igdb_slug) return undefined;
  return stored.data;
}

/** Whether a game's stored IGDB data needs fetching (again). */
export function isStale(game, { now = new Date() } = {}) {
  if (!game?.igdb_slug) return false;
  const stored = game.igdb;
  return (
    !stored?.fetched_at ||
    stored.slug !== game.igdb_slug ||
    now.getTime() - stored.fetched_at.getTime() > STALE_AFTER_MS
  );
}

/**
 * Fetches and stores a game's IGDB data, unless a refresh is already running.
 * When the request fails, the claim stays: the next try waits out
 * REFRESH_GUARD_MS.
 */
export async function refreshIGDBData({ id, igdb_slug }, { now = new Date() } = {}) {
  if (!igdb_slug) return false;
  if (!(await claimIGDBRefresh(id, igdb_slug, { now, guardMs: REFRESH_GUARD_MS }))) return false;

  const data = await fetchIGDBGame(igdb_slug, { now });
  await saveIGDBData(id, igdb_slug, data);
  return true;
}

/**
 * Runs a task without making the response wait for it: with
 * `ctx.waitUntil` on Workers, fire-and-forget on Node. Failures are logged.
 */
export function afterResponse(context, task) {
  const promise = Promise.resolve()
    .then(task)
    .catch((error) => console.error('Background task failed:', error));
  context?.cloudflare?.ctx?.waitUntil?.(promise);
  return promise;
}

/** Refreshes the game's IGDB data after the response if it's stale. */
export function refreshIfStale(game, context) {
  if (!isStale(game)) return;
  afterResponse(context, () => refreshIGDBData(game));
}
