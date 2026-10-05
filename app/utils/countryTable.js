// The rows of the countries table (#258): every country with something
// placed in it, with its studios, associations, games made there and
// events held there, and its continent.

export const CONTINENTS = [
  ['EU', 'Europe'],
  ['NA', 'North America'],
  ['SA', 'South America'],
  ['AS', 'Asia'],
  ['OC', 'Oceania'],
  ['AF', 'Africa'],
  ['AN', 'Antarctica'],
];
const ORDER = Object.fromEntries(CONTINENTS.map(([code], i) => [code, i]));

/**
 * @param locations  { country_code, entity: [{ type }] }[]
 * @param gameLinks  { game_id, entity: { location: { country_code } } }[]
 * @param events     { location: { country_code } }[]
 * @param names      country code → name; codes without one are skipped
 * @param continents country code → continent code
 *
 * Ranked by studios and associations (rank 1 is the biggest scene), then
 * ordered by continent, biggest first within each: a periodic table's
 * groups.
 */
export function countryTable({
  locations,
  gameLinks,
  events,
  names,
  continents,
}) {
  const games = new Map();
  for (const { game_id, entity } of gameLinks) {
    const code = entity?.location?.country_code;
    if (code) games.set(code, (games.get(code) ?? new Set()).add(game_id));
  }
  const eventCounts = new Map();
  for (const { location } of events) {
    const code = location?.country_code;
    if (code) eventCounts.set(code, (eventCounts.get(code) ?? 0) + 1);
  }

  const rows = new Map();
  for (const { country_code: code, entity } of locations) {
    if (!names[code]) continue;
    const row = rows.get(code) ?? {
      code,
      name: names[code],
      continent: continents[code] ?? null,
      studios: 0,
      associations: 0,
      games: games.get(code)?.size ?? 0,
      events: eventCounts.get(code) ?? 0,
    };
    for (const { type } of entity) {
      if (type === 'studio') row.studios += 1;
      if (type === 'association') row.associations += 1;
    }
    rows.set(code, row);
  }

  const size = (row) => row.studios + row.associations;
  const ranked = [...rows.values()].sort(
    (a, b) => size(b) - size(a) || a.name.localeCompare(b.name)
  );
  ranked.forEach((row, i) => (row.rank = i + 1));
  return ranked.sort(
    (a, b) =>
      (ORDER[a.continent] ?? 99) - (ORDER[b.continent] ?? 99) || a.rank - b.rank
  );
}
