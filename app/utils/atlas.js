/**
 * The atlas (/places): its plates, the lettered squares over the map, the
 * scale bar and the gazetteer beside it.
 */
import { mercatorY } from './mapFocus';

// The plates: a part of the world, as the box the map fits. `key` names its
// message (atlas.plate.world).
export const PLATES = [
  { key: 'world', sw: [-50, -150], ne: [70, 170] },
  { key: 'americas', sw: [-50, -125], ne: [60, -40] },
  { key: 'europe', sw: [35, -12], ne: [60, 32] },
  { key: 'africa', sw: [-35, -20], ne: [36, 52] },
  { key: 'asia', sw: [-45, 65], ne: [50, 180] },
].map((plate) => ({
  ...plate,
  center: [(plate.sw[0] + plate.ne[0]) / 2, (plate.sw[1] + plate.ne[1]) / 2],
}));

export const COLUMNS = 'ABCDEFGH'.split('');
export const ROWS = [1, 2, 3, 4, 5, 6];

/**
 * The square a point is in, on a map showing `bounds` ({ ne, sw } as [lat,
 * lng]): "D4". Latitudes are spaced as the map draws them. Null without bounds
 * or outside them.
 */
export function gridRef({ latitude, longitude }, bounds) {
  if (!bounds) return null;
  const { ne, sw } = bounds;
  // Across the antimeridian, the east edge reads as less than the west.
  const east = ne[1] < sw[1] ? ne[1] + 360 : ne[1];
  const lng = longitude < sw[1] ? longitude + 360 : longitude;
  const x = (lng - sw[1]) / (east - sw[1]);
  const y =
    (mercatorY(ne[0]) - mercatorY(latitude)) /
    (mercatorY(ne[0]) - mercatorY(sw[0]));
  if (!(x >= 0 && x <= 1 && y >= 0 && y <= 1)) return null;
  const column = Math.min(COLUMNS.length - 1, Math.floor(x * COLUMNS.length));
  const row = Math.min(ROWS.length - 1, Math.floor(y * ROWS.length));
  return `${COLUMNS[column]}${ROWS[row]}`;
}

const NICE_KM = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

/**
 * The scale bar at a map's centre: the roundest distance under `maxWidth`
 * pixels, and how wide that is.
 */
export function scaleBar(latitude, zoom, maxWidth = 120) {
  const kmPerPixel =
    (156543.03 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom / 1000;
  const km =
    [...NICE_KM].reverse().find((nice) => nice / kmPerPixel <= maxWidth) ??
    NICE_KM[0];
  return { km, width: Math.round(km / kmPerPixel) };
}

const collator = new Intl.Collator('en');

/**
 * The gazetteer's rows, flat for its virtual list: each place, alphabetically,
 * then what's there by name. `place` rows have the square and what's counted
 * (`studio`, `association`, `event`); `entry` rows have the `item`.
 */
export function gazetteerRows(items, bounds) {
  const places = new Map();
  for (const item of items) {
    const { city, country_code: code } = item.location ?? {};
    const key = `${city ?? ''}|${code ?? ''}`;
    if (!places.has(key))
      places.set(key, { city: city ?? null, code: code ?? null, items: [] });
    places.get(key).items.push(item);
  }
  const rows = [];
  const sorted = [...places.entries()].sort(
    ([, a], [, b]) =>
      collator.compare(a.city ?? a.code ?? '', b.city ?? b.code ?? '') ||
      collator.compare(a.code ?? '', b.code ?? '')
  );
  for (const [key, place] of sorted) {
    const counts = { studio: 0, association: 0, event: 0 };
    for (const item of place.items) counts[item.type] += 1;
    const { latitude, longitude } = place.items[0].location;
    rows.push({
      kind: 'place',
      key,
      city: place.city,
      code: place.code,
      latitude,
      longitude,
      counts,
      ref: gridRef({ latitude, longitude }, bounds),
    });
    for (const item of [...place.items].sort((a, b) =>
      collator.compare(a.name, b.name)
    )) {
      rows.push({ kind: 'entry', key: item.id, item });
    }
  }
  return rows;
}
