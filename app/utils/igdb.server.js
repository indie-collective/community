import cache from 'memory-cache';
import igdb from 'igdb-api-node';

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
  const cachedGame = cache.get(`igbd-${slug}`);

  if (cachedGame !== null) {
    return {
      ...cachedGame,
      videos: cachedGame.videos || [], // weird, no videos -> no array
    };
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

    cache.put(`igbd-${slug}`, igdbGame);

    return {
      ...igdbGame,
      videos: igdbGame.videos || [], // weird, no videos -> no array
    };
  } catch (error) {
    console.log(`IGDB: Error when loading ${slug}`, error.message);
  }

  return undefined;
}
