import createIGDBClient from "igdb-api-node";

export const igdb = createIGDBClient(
  process.env.IGDB_CLIENT_ID,
  process.env.IGDB_APP_ACCESS_TOKEN
);

export async function getIGDBGame(slug) {
  try {
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
        'involved_companies.company.*',
      ])
      .where(`slug = "${slug}"`)
      .request('/games')

      return igdbGame;
  } catch (error) {
    console.log(`IGDB error (${slug})`, error.message);    
  }

  return undefined;
}
