import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  REFRESH_GUARD_MS,
  STALE_AFTER_MS,
  afterResponse,
  claimRefresh,
  isStale,
  refreshIGDBData,
  storedIGDBGame,
} from './igdbData.server';

const NOW = new Date('2026-10-07T12:00:00Z');
const ago = (ms) => new Date(NOW.getTime() - ms);

// The game_igdb and kv_store tables, in memory.
function fakeDb(igdbRows = {}) {
  const rows = { ...igdbRows };
  return {
    rows,
    game_igdb: {
      updateMany: async ({ where, data }) => {
        const row = rows[where.game_id];
        const free = row && (!row.refresh_started_at || row.refresh_started_at < where.OR[1].refresh_started_at.lt);
        if (free) Object.assign(row, data);
        return { count: free ? 1 : 0 };
      },
      create: async ({ data }) => {
        if (rows[data.game_id]) throw Object.assign(new Error('Unique constraint'), { code: 'P2002' });
        rows[data.game_id] = { ...data };
      },
      update: async ({ where, data }) => Object.assign(rows[where.game_id], data),
    },
    kv_store: {
      findUnique: async () => ({ value: 'token', expires_at: new Date(NOW.getTime() + 3600e3) }),
    },
  };
}

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

describe('claimRefresh', () => {
  it('creates the row for the first refresh, and refuses a second', async () => {
    const db = fakeDb();
    expect(await claimRefresh(db, 'g1', 'celeste', { now: NOW })).toBe(true);
    expect(db.rows.g1).toMatchObject({ slug: 'celeste', refresh_started_at: NOW });
    expect(await claimRefresh(db, 'g1', 'celeste', { now: NOW })).toBe(false);
  });

  it('refuses while a refresh started within the guard, and allows it after', async () => {
    const db = fakeDb({ g1: { game_id: 'g1', slug: 'celeste', refresh_started_at: ago(REFRESH_GUARD_MS - 1000) } });
    expect(await claimRefresh(db, 'g1', 'celeste', { now: NOW })).toBe(false);
    db.rows.g1.refresh_started_at = ago(REFRESH_GUARD_MS + 1000);
    expect(await claimRefresh(db, 'g1', 'celeste', { now: NOW })).toBe(true);
  });
});

describe('refreshIGDBData', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('stores the data for the slug it fetched, and clears the claim', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ id: 1, name: 'Celeste' }])));
    const db = fakeDb({ g1: { game_id: 'g1', slug: 'old-slug', data: { name: 'Old' }, refresh_started_at: null } });
    expect(await refreshIGDBData(db, { id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).toBe(true);
    expect(db.rows.g1).toMatchObject({ slug: 'celeste', data: { name: 'Celeste' }, refresh_started_at: null });
    expect(db.rows.g1.fetched_at).toBeInstanceOf(Date);
  });

  it('keeps the claim when the request fails, so retries wait', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));
    const db = fakeDb();
    await expect(refreshIGDBData(db, { id: 'g1', igdb_slug: 'celeste' }, { now: NOW })).rejects.toThrow();
    expect(db.rows.g1.refresh_started_at).toEqual(NOW);
    expect(await claimRefresh(db, 'g1', 'celeste', { now: NOW })).toBe(false);
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
