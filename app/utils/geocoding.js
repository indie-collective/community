/**
 * Mapbox geocoding (v5) shared by the location picker and the place-name
 * backfill. Results are requested in English (#208): without `language`,
 * Mapbox returns each place's local name ("Warszawa", "京都市").
 */
export const GEOCODING_LANGUAGE = 'en';

/** A forward (text) or reverse ([longitude, latitude]) geocoding URL. */
export function geocodingUrl(query, { token, types, language = GEOCODING_LANGUAGE, autocomplete = true } = {}) {
  const search = Array.isArray(query) ? query.join(',') : encodeURIComponent(query);
  const params = new URLSearchParams({ access_token: token, language });
  if (!Array.isArray(query) && autocomplete) params.set('autocomplete', 'true');
  if (types?.length) params.set('types', types.join(','));
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?${params}`;
}

/** The city and region names in a reverse-geocoding response's features. */
export function placeNames(features = []) {
  const byType = (type) => features.find((feature) => feature.place_type?.includes(type))?.text ?? null;
  return { city: byType('place'), region: byType('region') };
}
