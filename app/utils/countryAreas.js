// A country's main areas, and where their callouts go on the map (#258).

const RADIUS_KM = 40;

const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance in km between two { lat, lng }. */
export function distanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Cities grouped into areas, the biggest first: a city within `radius` km
 * of an area's biggest city joins it, so Lille, Roubaix and Tourcoing make
 * one area and Paris takes in its suburbs. An area is named after its
 * biggest city and sits at its cities' position weighted by their counts.
 * Cities without coordinates are left out.
 */
export function areasOf(cities, radius = RADIUS_KM) {
  const groups = [];
  const placed = cities
    .filter((city) => city.lat != null && city.lng != null)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  for (const city of placed) {
    const group = groups.find((g) => distanceKm(g[0], city) <= radius);
    if (group) group.push(city);
    else groups.push([city]);
  }
  return groups
    .map((list) => {
      const count = list.reduce((n, c) => n + c.count, 0);
      return {
        name: list[0].name,
        region: list[0].region ?? null,
        cities: list,
        count,
        studios: list.reduce((n, c) => n + c.studios, 0),
        associations: list.reduce((n, c) => n + c.associations, 0),
        lat: list.reduce((n, c) => n + c.lat * c.count, 0) / count,
        lng: list.reduce((n, c) => n + c.lng * c.count, 0) / count,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Where each callout goes: the left or right column, whichever side of
 * `middle` its point is on (rebalanced so neither column has more than one
 * extra), at its point's height, pushed apart by at least `gap` and kept
 * between `top` and `bottom`. `points` are { x, y }; returns
 * { side, y } in the same order.
 */
export function layoutCallouts(points, { middle, top, bottom, gap }) {
  const items = points.map((point, index) => ({ ...point, index }));
  const left = items.filter((item) => item.x < middle);
  const right = items.filter((item) => item.x >= middle);
  const move = (from, to, pick) => {
    const item = from.reduce(pick);
    from.splice(from.indexOf(item), 1);
    to.push(item);
  };
  // Move the points nearest the middle across.
  while (left.length > right.length + 1)
    move(left, right, (a, b) => (b.x > a.x ? b : a));
  while (right.length > left.length + 1)
    move(right, left, (a, b) => (b.x < a.x ? b : a));

  const result = [];
  for (const [column, side] of [
    [left, 'left'],
    [right, 'right'],
  ]) {
    column.sort((a, b) => a.y - b.y);
    const ys = [];
    for (const item of column) {
      ys.push(Math.max(item.y, top, ys.length ? ys.at(-1) + gap : -Infinity));
    }
    // Pull the column back up if it runs past the bottom.
    for (let k = ys.length - 1, limit = bottom; k >= 0; k -= 1) {
      ys[k] = Math.min(ys[k], limit);
      limit = ys[k] - gap;
    }
    column.forEach((item, k) => (result[item.index] = { side, y: ys[k] }));
  }
  return result;
}
