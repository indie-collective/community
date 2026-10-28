import { describe, expect, it, vi } from 'vitest';

import { CACHE_SECONDS, isCacheable, withEdgeCache } from './edgeCache';

const get = (path, cookie) =>
  new Request(`https://community.indieco.xyz${path}`, cookie ? { headers: { cookie } } : {});

describe('isCacheable', () => {
  it.each(['/', '/games?sort=name', '/game/1', '/games.data', '/images/a.png'])('caches %s for signed-out visitors', (path) => {
    expect(isCacheable(get(path))).toBe(true);
  });

  it('never caches a signed-in visitor', () => {
    expect(isCacheable(get('/games', 'theme=dark; _session=abc'))).toBe(false);
    expect(isCacheable(get('/games', '_session=abc'))).toBe(false);
    expect(isCacheable(get('/games', 'not_session=abc'))).toBe(true);
  });

  it.each(['/signin', '/signin.data', '/auth/bluesky/callback', '/oauth/client-metadata.json', '/profile', '/admin/users', '/welcome', '/logout', '/my-calendar/p1.sig', '/my-feed/p1.sig', '/notifications'])(
    'never caches %s',
    (path) => {
      expect(isCacheable(get(path))).toBe(false);
    }
  );

  it('never caches other methods', () => {
    expect(isCacheable(new Request('https://community.indieco.xyz/games', { method: 'POST' }))).toBe(false);
  });
});

describe('withEdgeCache', () => {
  const cache = () => {
    const stored = new Map();
    return {
      stored,
      match: vi.fn(async (key) => stored.get(key.url)?.clone()),
      put: vi.fn(async (key, response) => void stored.set(key.url, response)),
    };
  };
  const ctx = () => {
    const pending = [];
    return { pending, waitUntil: (promise) => pending.push(promise) };
  };
  const page = (body = 'page', init = {}) => vi.fn(async () => new Response(body, { status: 200, ...init }));

  it('stores a signed-out page, then serves it without rendering', async () => {
    const c = cache();
    const handle = page();
    const first = ctx();
    const miss = await withEdgeCache(get('/games'), first, handle, c);
    await Promise.all(first.pending);
    expect(await miss.text()).toBe('page');
    expect(miss.headers.get('X-Edge-Cache')).toBe('MISS');
    expect(c.stored.get('https://community.indieco.xyz/games').headers.get('Cache-Control')).toBe(`public, max-age=${CACHE_SECONDS}`);

    const hit = await withEdgeCache(get('/games'), ctx(), handle, c);
    expect(await hit.text()).toBe('page');
    expect(hit.headers.get('X-Edge-Cache')).toBe('HIT');
    expect(hit.headers.get('Cache-Control')).toBe('private, no-cache');
    expect(handle).toHaveBeenCalledOnce();
  });

  it('renders signed-in visitors, and stores nothing', async () => {
    const c = cache();
    const handle = page();
    await withEdgeCache(get('/games', '_session=abc'), ctx(), handle, c);
    expect(c.match).not.toHaveBeenCalled();
    expect(c.put).not.toHaveBeenCalled();
  });

  it('stores no error, and no response that sets a cookie', async () => {
    const c = cache();
    await withEdgeCache(get('/nope'), ctx(), page('missing', { status: 404 }), c);
    await withEdgeCache(get('/games'), ctx(), page('x', { headers: { 'Set-Cookie': 'a=b' } }), c);
    expect(c.put).not.toHaveBeenCalled();
  });

  it('works without a cache (local development)', async () => {
    expect(await (await withEdgeCache(get('/games'), ctx(), page(), undefined)).text()).toBe('page');
  });
});
