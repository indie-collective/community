import cache from 'memory-cache';
import igdb from 'igdb-api-node';
import { db } from './db.server';

const GAME_CACHE_TTL = 1000 * 60 * 60 * 24 * 14; // 14 days

async function refreshAccessToken(errorIfFail = false) {
  try {
    const result = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      {
        method: 'POST',
      }
    );

    const data = await result.json();

    return data;
  } catch (err) {
    console.log(err);

    if (errorIfFail) throw err;

    // retrying
    return refreshAccessToken(true);
  }
}

async function getAppAccessToken() {
  const token = cache.get('igdb-access-token');

  if (token) return token;

  console.log('No promise to access token found in cache. Fetching new one...');

  return cache.put('igdb-access-token', refreshAccessToken(), 2147483647);
}

export async function getIGDBGame(slug) {
  // Try to return cached version first to reduce calls to IGDB
  const cachedGame = cache.get(`igdb-game-${slug}`);
  if (cachedGame) {
    console.log(`IGDB: Cache hit for '${slug}'.`);
    return cachedGame;
  }

  // Fallback to database cache
  const dbCached = await db.igdb_cache.findUnique({ where: { slug } });
  if (
    dbCached &&
    Date.now() - new Date(dbCached.updated_at ?? dbCached.created_at).getTime() < GAME_CACHE_TTL
  ) {
    console.log(`IGDB: DB cache hit for '${slug}'.`);
    cache.put(`igdb-game-${slug}`, dbCached.data, GAME_CACHE_TTL);
    return dbCached.data;
  }

  try {
    const { access_token: token } = await getAppAccessToken();

    console.log(`IGDB: Fetching '${slug}'.`);

    const {
      data: [igdbGame],
    } = await igdb(process.env.IGDB_CLIENT_ID, token)
      .fields([
        'name',
        'status',
        'genres.*',
        'themes.*',
        'screenshots.*',
        'videos.*',
        'websites.*',
        'involved_companies.company.*',
      ])
      .where(`slug = "${slug}"`)
      .request('/games');

    if (!igdbGame) {
      console.log(`IGDB: No game found for '${slug}'.`)
      return undefined;
    }

    const result = {
      ...igdbGame,
      videos: igdbGame.videos || [], // no videos -> no array
      screenshots: igdbGame.screenshots || [], // no screenshots -> no array
    };

    // Cache the game data
    cache.put(`igdb-game-${slug}`, result, GAME_CACHE_TTL);
    await db.igdb_cache.upsert({
      where: { slug },
      create: { slug, data: result },
      update: { data: result, updated_at: new Date() },
    });

    return result;
  } catch (error) {
    console.log(`IGDB: Error when loading ${slug}`, error.message);
  }

  return undefined;
}
