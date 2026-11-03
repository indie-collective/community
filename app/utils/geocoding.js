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

/**
 * A Mapbox feature as a place: street, city, region, country code, longitude
 * and latitude, and for a place of interest (#390) its name as `venueName`.
 */
export function placeFromFeature(place) {
  let countryCode, region, city, street;

  place.place_type.forEach((type) => {
    switch (type) {
      case 'country':
        countryCode = place.properties.short_code;
        break;
      case 'region':
        region = place.text;
        break;
      case 'place':
        city = place.text;
        break;
      case 'address':
        if (place.address) street = place.address + ' ' + place.text;
        else street = place.text;
        break;
      case 'poi':
        street = place.properties?.address;
        break;
      default:
        break;
    }
  });

  place.context?.forEach((context) => {
    if (context.id.includes('country')) countryCode = context.short_code;

    if (context.id.includes('region')) region = context.text;

    if (context.id.includes('place')) city = context.text;

    // `address` was never defined here: an address in the context
    // threw a ReferenceError.
    if (context.id.includes('address')) street = context.text;
  });

  // there are some territories with short codes on region instead, e.g RE for Reunion Island
  if (place.context && !place.context.find((c) => c.id.includes('country'))) {
    countryCode = place.context.find((c) => c.id.includes('region'))?.short_code;
  }

  return {
    street,
    city,
    region: region || city,
    countryCode: countryCode?.toUpperCase(),
    longitude: place.geometry.coordinates[0],
    latitude: place.geometry.coordinates[1],
    venueName: place.place_type.includes('poi') ? place.text : undefined,
  };
}
