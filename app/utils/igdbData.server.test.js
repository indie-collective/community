import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  REFRESH_GUARD_MS,
  STALE_AFTER_MS,
  afterResponse,
  isStale,
  refreshIGDBData,
  storedIGDBGame,
} from './igdbData.server';

const NOW = new Date('2026-10-07T12:00:00Z');
const ago = (ms) => new Date(NOW.getTime() - ms);

// The stored IGDB data and the token, in memory.
const store = vi.hoisted(() => ({ rows: {} }));
vi.mock('../data/igdb.server.js', () => ({
  claimIGDBRefresh: async (gameId, slug, { now, guardMs }) => {
    const row = store.rows[gameId];
    if (!row) {
      store.rows[gameId] = { game_id: gameId, slug, refresh_started_at: now };
      return true;
    }
    if (row.refresh_started_at && row.refresh_started_at >= new Date(now.getTime() - guardMs)) return false;
    row.refresh_started_at = now;
    return true;
  },
  saveIGDBData: async (gameId, slug, data) =>
    Object.assign(store.rows[gameId], { slug, data, fetched_at: new Date(), refresh_started_at: null }),
}));
vi.mock('../data/kv.server.js', () => ({
  getValue: async () => ({ value: 'token', expires_at: new Date(NOW.getTime() + 3600e3) }),
  setValue: async () => {},
}));
beforeEach(() => {
  store.rows = {};
});

describe('storedIGDBGame', () => {
  it('returns the data fetched for the current slug only', () => {
    const igdb = { slug: 'celeste', data: { name: 'Celeste' } };
    expect(storedIGDBGame({ igdb_slug: 'celeste', igdb })).toEqual({ name: 'Celeste' });
    expect(storedIGDBGame({ igdb_slug: 'celeste-2', igdb })).toBeUndefined();
    expect(storedIGDBGame({ igdb_slug: null, igdb })).toBeUndefined();
    expect(storedIGDBGame({ igdb_slug: 'celeste' })).toBeUndefined();
  });
});

describe('isStale', () => {
  it.each([
    ['no slug', { igdb_slug: null }, false],
    ['never fetched', { igdb_slug: 'celeste', igdb: null }, true],
    ['claimed but not fetched', { igdb_slug: 'celeste', igdb: { slug: 'celeste', fetched_at: null } }, true],
    ['fetched an hour ago', { igdb_slug: 'celeste', igdb: { slug: 'celeste', fetched_at: ago(3600e3) } }, false],
    ['fetched over a day ago', { igdb_slug: 'celeste', igdb: { slug: 'celeste', fetched_at: ago(STALE_AFTER_MS + 1) } }, true],
    ['fetched for another slug', { igdb_slug: 'celeste-2', igdb: { slug: 'celeste', fetched_at: ago(1000) } }, true],
  ])('%s → %s', (_, game, expected) => {
    expect(isStale(game, { now: NOW })).toBe(expected);
  });
});

describe('refreshIGDBData', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('stores the data for the slug it fetched, and clears the claim', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ id: 1, name: 'Celeste' }])));
    store.rows.g1 = { game_id: 'g1', slug: 'old-slug', data: { name: 'Old' }, refresh_started_at: null };
    expect(await refreshIGDBData({ id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).toBe(true);
    expect(store.rows.g1).toMatchObject({ slug: 'celeste', data: { name: 'Celeste' }, refresh_started_at: null });
    expect(store.rows.g1.fetched_at).toBeInstanceOf(Date);
  });

  it('skips a game whose refresh started within the guard', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    store.rows.g1 = { game_id: 'g1', slug: 'celeste', refresh_started_at: ago(REFRESH_GUARD_MS - 1000) };
    expect(await refreshIGDBData({ id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the claim when the request fails, so retries wait', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    await expect(refreshIGDBData({ id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).rejects.toThrow();
    expect(store.rows.g1.refresh_started_at).toEqual(NOW);
    expect(await refreshIGDBData({ id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).toBe(false);
  });
});

describe('afterResponse', () => {
  it('hands the task to waitUntil when there is one, and logs failures', async () => {
    const waitUntil = vi.fn();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const promise = afterResponse({ cloudflare: { ctx: { waitUntil } } }, () => {
      throw new Error('boom');
    });
    expect(waitUntil).toHaveBeenCalledWith(promise);
    await promise;
    expect(error).toHaveBeenCalledWith('Background task failed:', expect.any(Error));
    error.mockRestore();
  });
});
