// A short edge cache for signed-out visitors (ADR 0002): most requests
// come from them, and rendering a list costs 160–220 ms of CPU. Pages
// differ only by the session cookie (the root loader reads nothing else),
// so a request without one gets the cached page for a minute. Edits show
// to signed-out visitors within that minute.
//
// The Cache API only works on a custom domain, not on *.workers.dev.
import { languageOf } from '../app/i18n/language.js';

export const CACHE_SECONDS = 60;

// Pages that are per-person, or part of signing in, even without a session.
// Private calendars and feeds (#342, #343) are behind secret addresses:
// still not for a shared cache.
const PRIVATE = /^\/(auth|oauth|signin|logout|welcome|profile|admin|check-username-availability|healthcheck|my-calendar|my-feed|notifications|follow|sources|feedback)(\/|\.data$|$)/;

/** Whether a request may be answered from, and stored in, the cache. */
export function isCacheable(request) {
  if (request.method !== 'GET') return false;
  const cookies = request.headers.get('cookie') ?? '';
  if (/(^|;\s*)_session=/.test(cookies)) return false;
  return !PRIVATE.test(new URL(request.url).pathname);
}

// Browsers don't keep it: once signed in, the next request must reach the
// Worker with the session cookie.
const forBrowser = (response, status) => {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-cache');
  headers.set('X-Edge-Cache', status);
  return new Response(response.body, { status: response.status, headers });
};

/**
 * Answers `request` from `cache`, or with `handle(request)`, storing the
 * response when it's a 200 that sets no cookie.
 */
export async function withEdgeCache(request, ctx, handle, cache) {
  if (!cache || !isCacheable(request)) return handle(request);

  // Pages differ by language too (#344): one cached copy for each.
  const keyUrl = new URL(request.url);
  keyUrl.searchParams.set('__lang', languageOf(request));
  const key = new Request(keyUrl, { method: 'GET' });
  const cached = await cache.match(key);
  if (cached) return forBrowser(cached, 'HIT');

  const response = await handle(request);
  if (response.status !== 200 || response.headers.has('Set-Cookie')) {
    return response;
  }
  const stored = new Response(response.clone().body, response);
  stored.headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
  ctx.waitUntil(cache.put(key, stored));
  return forBrowser(response, 'MISS');
}
