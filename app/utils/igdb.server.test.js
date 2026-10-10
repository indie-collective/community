import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchIGDBGame, gameQuery, getAccessToken, isIGDBSlug, quoteApicalypse } from './igdb.server';

// The kv_store table, in memory.
// The key-value store, in memory.
const kv = vi.hoisted(() => ({ rows: {} }));
vi.mock('../data/kv.server.js', () => ({
  getValue: async (key) => kv.rows[key] ?? null,
  setValue: async (key, value, { expiresAt }) => (kv.rows[key] = { value, expires_at: expiresAt }),
}));
const storeKv = (rows = {}) => {
  kv.rows = { ...rows };
};

const NOW = new Date('2026-10-07T12:00:00Z');
const minutes = (n) => new Date(NOW.getTime() + n * 60 * 1000);

describe('the IGDB query', () => {
  it('quotes the slug so `"` and `\\` stay inside the string', () => {
    expect(quoteApicalypse('a"; fields *; where id > 0; "')).toBe('"a\\"; fields *; where id > 0; \\""');
    expect(quoteApicalypse('a\\"b')).toBe('"a\\\\\\"b"');
    expect(gameQuery('celeste')).toContain('where slug = "celeste"; limit 1;');
  });

  it.each([
    ['celeste', true],
    ['doom--1', true],
    ['the-witcher-3-wild-hunt', true],
    ['celeste"; where id > 0', false],
    ['Celeste', false],
    ['celeste/', false],
    ['', false],
    [null, false],
  ])('%j is an IGDB slug: %s', (slug, expected) => {
    expect(isIGDBSlug(slug)).toBe(expected);
  });
});

describe('getAccessToken', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reuses a stored token that has time left', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    storeKv({ 'igdb-access-token': { value: 'stored', expires_at: minutes(60) } });
    expect(await getAccessToken({ now: NOW })).toBe('stored');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['is missing', {}],
    ['expires within the margin', { 'igdb-access-token': { value: 'old', expires_at: minutes(5) } }],
    ['has expired', { 'igdb-access-token': { value: 'old', expires_at: minutes(-1) } }],
  ])('gets and stores a new token when the stored one %s', async (_, rows) => {
    const fetchMock = vi.fn(async () => Response.json({ access_token: 'new', expires_in: 3600 }));
    vi.stubGlobal('fetch', fetchMock);
    storeKv(rows);
    expect(await getAccessToken({ now: NOW })).toBe('new');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(kv.rows['igdb-access-token']).toMatchObject({ value: 'new', expires_at: minutes(60) });
  });

  it('throws when Twitch refuses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 400 })));
    storeKv();
    await expect(getAccessToken({ now: NOW })).rejects.toThrow('Twitch token request failed: 400');
  });
});

describe('fetchIGDBGame', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => storeKv({ 'igdb-access-token': { value: 'token', expires_at: minutes(60) } }));

  it('sends the quoted query with the token and fills in missing lists', async () => {
    const fetchMock = vi.fn(async () => Response.json([{ id: 1, name: 'Celeste' }]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchIGDBGame('celeste', { now: NOW })).toEqual({ id: 1, name: 'Celeste', videos: [], screenshots: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/games$/);
    expect(init.headers.Authorization).toBe('Bearer token');
    expect(init.body).toBe(gameQuery('celeste'));
  });

  it('returns null when IGDB has no such game, and never asks about a non-slug', async () => {
    const fetchMock = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchIGDBGame('nothing-here', { now: NOW })).toBeNull();
    expect(await fetchIGDBGame('x" | id > 0', { now: NOW })).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 429 })));
    await expect(fetchIGDBGame('celeste', { now: NOW })).rejects.toThrow('failed: 429');
  });
});
