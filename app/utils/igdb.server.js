/**
 * The IGDB API (#254): fetches a game by its slug, with an app access token
 * from Twitch that's stored in the database with its expiry, since memory
 * doesn't last between requests on Workers.
 *
 * Both APIs are configurable (IGDB_API, TWITCH_OAUTH_API) so tests can stand
 * in for them.
 */
const igdbApi = () => process.env.IGDB_API || 'https://api.igdb.com/v4';
const twitchOAuthApi = () => process.env.TWITCH_OAUTH_API || 'https://id.twitch.tv/oauth2';

const TOKEN_KEY = 'igdb-access-token';
// Get a new token this long before the current one expires.
const TOKEN_MARGIN_MS = 10 * 60 * 1000;

const FIELDS = [
  'name',
  'status',
  'genres.*',
  'themes.*',
  'screenshots.*',
  'videos.*',
  'websites.*',
  'involved_companies.company.*',
];

// IGDB slugs: lowercase letters, digits and hyphens ("doom--1").
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** Whether this looks like an IGDB slug; other values are never sent to IGDB. */
export const isIGDBSlug = (slug) => typeof slug === 'string' && slug.length <= 255 && SLUG.test(slug);

/** The slug as an Apicalypse string literal: `"` and `\` can't end it early. */
export const quoteApicalypse = (value) => `"${String(value).replace(/[\\"]/g, '\\$&')}"`;

/** The Apicalypse query for one game by slug. */
export const gameQuery = (slug) => `fields ${FIELDS.join(',')}; where slug = ${quoteApicalypse(slug)}; limit 1;`;

/**
 * A token from the store while it has more than TOKEN_MARGIN_MS left, else a
 * new one from Twitch, which is stored with its expiry.
 */
export async function getAccessToken(db, { now = new Date() } = {}) {
  const stored = await db.kv_store.findUnique({ where: { key: TOKEN_KEY } });
  if (stored?.expires_at && stored.expires_at.getTime() - TOKEN_MARGIN_MS > now.getTime()) {
    return stored.value;
  }

  const params = new URLSearchParams({
    client_id: process.env.IGDB_CLIENT_ID ?? '',
    client_secret: process.env.IGDB_CLIENT_SECRET ?? '',
    grant_type: 'client_credentials',
  });
  const response = await fetch(`${twitchOAuthApi()}/token?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Twitch token request failed: ${response.status}`);
  const { access_token, expires_in } = await response.json();
  if (!access_token) throw new Error('Twitch token response has no access_token');

  const expires_at = new Date(now.getTime() + Number(expires_in) * 1000);
  await db.kv_store.upsert({
    where: { key: TOKEN_KEY },
    create: { key: TOKEN_KEY, value: access_token, expires_at },
    update: { value: access_token, expires_at },
  });
  return access_token;
}

/**
 * The IGDB game with this slug, or null when IGDB has none. Throws when a
 * request fails, so a failed refresh isn't mistaken for "no such game".
 */
export async function fetchIGDBGame(db, slug, { now } = {}) {
  if (!isIGDBSlug(slug)) return null;
  const token = await getAccessToken(db, { now });
  const response = await fetch(`${igdbApi()}/games`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Client-ID': process.env.IGDB_CLIENT_ID ?? '',
      Authorization: `Bearer ${token}`,
    },
    body: gameQuery(slug),
  });
  if (!response.ok) throw new Error(`IGDB request for "${slug}" failed: ${response.status}`);

  const [game] = await response.json();
  if (!game) return null;

  return {
    ...game,
    videos: game.videos || [], // no videos -> no array
    screenshots: game.screenshots || [], // no screenshots -> no array
  };
}
