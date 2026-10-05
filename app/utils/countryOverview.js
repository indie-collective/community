/**
 * The cities with the most studios and associations, from their locations
 * (one per organisation). Each city keeps the region most of its
 * organisations give, since older places name regions inconsistently (#73).
 */
export function topCities(locations, limit = 10) {
  const byCity = new Map();
  for (const location of locations) {
    const city = location?.city?.trim();
    if (!city) continue;
    const entry = byCity.get(city) ?? { name: city, count: 0, regions: new Map() };
    entry.count += 1;
    const region = location.region?.trim();
    if (region) entry.regions.set(region, (entry.regions.get(region) ?? 0) + 1);
    byCity.set(city, entry);
  }

  return [...byCity.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ name, count, regions }) => ({
      name,
      count,
      region:
        [...regions].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null,
    }));
}

/**
 * Organisations as map points: one per place with coordinates, with how
 * many organisations are there.
 */
export function orgPoints(locations) {
  const byPlace = new Map();
  for (const location of locations) {
    const { latitude: lat, longitude: lng } = location ?? {};
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const key = `${lat},${lng}`;
    const point = byPlace.get(key) ?? { lat, lng, count: 0 };
    point.count += 1;
    byPlace.set(key, point);
  }
  return [...byPlace.values()];
}
