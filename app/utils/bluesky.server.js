/**
 * Bluesky handles on studios and associations (#161).
 *
 * The public API is configurable (BLUESKY_API) so tests can stand in for it.
 */
const api = () => process.env.BLUESKY_API || 'https://public.api.bsky.app';

// A domain name: labels of letters, digits and hyphens, at least two.
const HANDLE = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]*[a-z0-9]$/;

/** "@Studio.bsky.social" or a bsky.app profile URL → "studio.bsky.social". */
export function normalizeBlueskyHandle(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?bsky\.app\/profile\//, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '');
}

/**
 * The normalised handle, or null for an empty field. Throws an Error with a
 * message for the form when it isn't a handle or doesn't resolve.
 */
export async function checkBlueskyHandle(value) {
  const handle = normalizeBlueskyHandle(value);
  if (!handle) return null;
  if (!HANDLE.test(handle)) throw new Error(`"${String(value).trim()}" isn't a Bluesky handle (like studio.bsky.social).`);

  const response = await fetch(`${api()}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`).catch(() => null);
  if (!response?.ok) throw new Error(`No Bluesky account is called "${handle}".`);
  return handle;
}
