// Fetching records' pages elsewhere (#338): web pages (and itch.io pages),
// Steam's store API and Bluesky's public API. Their addresses are
// configurable (STEAM_STORE_API, BLUESKY_API) so tests can stand in for them.
import { blueskyFields, pageFields, parsePage, steamFields } from './sources';

const steamApi = () => process.env.STEAM_STORE_API || 'https://store.steampowered.com/api';
const blueskyApi = () => process.env.BLUESKY_API || 'https://public.api.bsky.app';

const USER_AGENT = 'IndieCollectiveBot/1.0 (+https://community.indieco.xyz/about)';
const MAX_BYTES = 1_500_000;

// A page's text, at most MAX_BYTES of it, within 8 seconds.
async function fetchText(url, { accept = 'text/html' } = {}) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: accept },
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * What a source (as utils/sources' detectSource gives it) says about a
 * record of `kind`: its fields, or null when it says nothing. Throws when it
 * can't be read.
 */
export async function readSource(kind, { source, id, url }) {
  if (source === 'steam') {
    if (kind !== 'game') return null;
    const answer = JSON.parse(await fetchText(`${steamApi()}/appdetails?appids=${id}&l=english`, { accept: 'application/json' }));
    return steamFields(answer, id);
  }
  if (source === 'bluesky') {
    const profile = JSON.parse(
      await fetchText(`${blueskyApi()}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(id)}`, { accept: 'application/json' })
    );
    return blueskyFields(profile);
  }
  const fields = pageFields(parsePage(await fetchText(url), url), kind, url);
  return Object.keys(fields).length > 0 ? fields : null;
}
