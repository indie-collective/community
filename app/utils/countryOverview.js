/**
 * A country's cities, the most studios and associations first, from the
 * organisations' types and locations (#258). Each city has:
 * - the region most of its organisations give, since older places name
 *   regions inconsistently (#73);
 * - its studios and associations counted apart;
 * - a point for the map: the mean of its organisations' coordinates, or
 *   null when none has any;
 * - its organisations, for the city's drill-down.
 */
export function citiesOf(orgs) {
  const byCity = new Map();
  for (const org of orgs) {
    const city = org?.location?.city?.trim();
    if (!city) continue;
    const entry = byCity.get(city) ?? {
      name: city,
      count: 0,
      studios: 0,
      associations: 0,
      regions: new Map(),
      orgs: [],
      lat: 0,
      lng: 0,
      placed: 0,
    };
    entry.count += 1;
    if (org.type === 'studio') entry.studios += 1;
    if (org.type === 'association') entry.associations += 1;
    const region = org.location.region?.trim();
    if (region) entry.regions.set(region, (entry.regions.get(region) ?? 0) + 1);
    const { latitude, longitude } = org.location;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      entry.lat += latitude;
      entry.lng += longitude;
      entry.placed += 1;
    }
    entry.orgs.push({ id: org.id, name: org.name, type: org.type });
    byCity.set(city, entry);
  }

  return [...byCity.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map(({ regions, lat, lng, placed, orgs: list, ...city }) => ({
      ...city,
      region:
        [...regions].sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
        )[0]?.[0] ?? null,
      lat: placed ? lat / placed : null,
      lng: placed ? lng / placed : null,
      orgs: list.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

/**
 * Associations grouped by city, the cities with the most first (#258):
 * newcomers look for the one near them. Associations without a city come
 * last, under `null`.
 */
export function associationsByCity(associations) {
  const byCity = new Map();
  for (const association of associations) {
    const city = association.location?.city?.trim() || null;
    byCity.set(city, [...(byCity.get(city) ?? []), association]);
  }
  return [...byCity]
    .map(([city, list]) => ({
      city,
      associations: list.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort(
      (a, b) =>
        (a.city === null) - (b.city === null) ||
        b.associations.length - a.associations.length ||
        (a.city ?? '').localeCompare(b.city ?? '')
    );
}
