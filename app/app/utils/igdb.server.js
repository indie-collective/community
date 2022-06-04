import createIGDBClient from "igdb-api-node";

export const igdb = createIGDBClient(
  process.env.IGDB_CLIENT_ID,
  process.env.IGDB_APP_ACCESS_TOKEN
);

export async function getIGDBGame(slug) {
  const {
    data: [igdbGame],
  } = await igdb
    .fields([
      'name',
      'status',
      'genres.*',
      'themes.*',
      'screenshots.*',
      'videos.*',
      'websites.*',
    ])
    .where(`slug = "${slug}"`)
    .request('/games')
    .catch((e) => console.log('igdb errored', e));

  return igdbGame;
}
