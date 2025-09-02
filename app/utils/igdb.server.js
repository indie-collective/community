import cache from 'memory-cache';
import igdb from 'igdb-api-node';
import { enqueueIgdbJob } from './pgmq.server';

const DAY_MS = 24 * 60 * 60 * 1000;

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

export async function fetchIGDBGame(slug) {
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

    return {
      ...igdbGame,
      videos: igdbGame.videos || [], // no videos -> no array
      screenshots: igdbGame.screenshots || [], // no screenshots -> no array
    };
  } catch (error) {
    console.log(`IGDB: Error when loading ${slug}`, error.message);
  }

  return undefined;
}

export async function getIGDBGame(game) {
  const { id, igdb_slug, igdb_data, igdb_data_fetched_at } = game;
  if (!igdb_slug) return undefined;

  const stale =
    !igdb_data_fetched_at ||
    Date.now() - new Date(igdb_data_fetched_at).getTime() > DAY_MS;

  if (stale) {
    await enqueueIgdbJob(id, igdb_slug);
  }

  return igdb_data || undefined;
}
