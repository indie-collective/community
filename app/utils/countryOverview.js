/**
 * The cities with the most studios and associations, from the
 * organisations' types and locations. Each city keeps the region most of
 * its organisations give, since older places name regions inconsistently
 * (#73), and counts its studios and associations apart (#258).
 */
export function topCities(orgs, limit = 10) {
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
    };
    entry.count += 1;
    if (org.type === 'studio') entry.studios += 1;
    if (org.type === 'association') entry.associations += 1;
    const region = org.location.region?.trim();
    if (region) entry.regions.set(region, (entry.regions.get(region) ?? 0) + 1);
    byCity.set(city, entry);
  }

  return [...byCity.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ regions, ...city }) => ({
      ...city,
      region:
        [...regions].sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
        )[0]?.[0] ?? null,
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
