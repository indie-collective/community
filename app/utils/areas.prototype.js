// PROTOTYPE (#258, annotated country map): a country's main areas. Cities
// within RADIUS_KM of an area's biggest city join it, so Lille, Roubaix and
// Tourcoing make one "Lille area", and Paris takes in its suburbs.
const RADIUS_KM = 40;

const toRad = (deg) => (deg * Math.PI) / 180;
function km(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function areasOf(cities, radius = RADIUS_KM) {
  const areas = [];
  const placed = cities.filter((c) => c.lat != null).sort((a, b) => b.count - a.count);
  for (const city of placed) {
    const area = areas.find((a) => km(a.cities[0], city) <= radius);
    if (area) area.cities.push(city);
    else areas.push({ cities: [city] });
  }
  return areas
    .map(({ cities: list }) => {
      const count = list.reduce((n, c) => n + c.count, 0);
      return {
        name: list[0].name,
        region: list[0].region,
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
