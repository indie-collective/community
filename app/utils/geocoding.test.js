import { describe, expect, it } from 'vitest';

import { geocodingUrl, placeFromFeature, placeNames } from './geocoding';

describe('geocodingUrl', () => {
  // #208: without language, Mapbox answered with local names.
  it('asks for English names when searching', () => {
    const url = new URL(geocodingUrl('Kraków, Poland', { token: 'pk.test', types: ['place', 'address'] }));
    expect(url.pathname).toBe(`/geocoding/v5/mapbox.places/${encodeURIComponent('Kraków, Poland')}.json`);
    expect(url.searchParams.get('language')).toBe('en');
    expect(url.searchParams.get('types')).toBe('place,address');
    expect(url.searchParams.get('autocomplete')).toBe('true');
  });

  it('reverse-geocodes coordinates as longitude,latitude', () => {
    const url = new URL(geocodingUrl([21.01, 52.23], { token: 'pk.test', types: ['place', 'region'] }));
    expect(url.pathname).toBe('/geocoding/v5/mapbox.places/21.01,52.23.json');
    expect(url.searchParams.get('language')).toBe('en');
    expect(url.searchParams.has('autocomplete')).toBe(false);
  });
});

describe('placeNames', () => {
  it('reads the city and region from the features', () => {
    const features = [
      { place_type: ['place'], text: 'Warsaw' },
      { place_type: ['region'], text: 'Masovian' },
      { place_type: ['country'], text: 'Poland' },
    ];
    expect(placeNames(features)).toEqual({ city: 'Warsaw', region: 'Masovian' });
  });

  it('leaves missing names null', () => {
    expect(placeNames([{ place_type: ['country'], text: 'Monaco' }])).toEqual({ city: null, region: null });
  });
});

describe('placeFromFeature', () => {
  const context = [
    { id: 'place.1', text: 'Rennes' },
    { id: 'region.1', text: 'Ille-et-Vilaine', short_code: 'FR-35' },
    { id: 'country.1', text: 'France', short_code: 'fr' },
  ];
  const geometry = { coordinates: [-1.68, 48.11] };

  // #390
  it('reads a place of interest: its name, and its address as the street', () => {
    expect(
      placeFromFeature({ place_type: ['poi'], text: 'Le Liberté', properties: { address: '1 Esplanade' }, geometry, context })
    ).toEqual({
      street: '1 Esplanade',
      city: 'Rennes',
      region: 'Ille-et-Vilaine',
      countryCode: 'FR',
      longitude: -1.68,
      latitude: 48.11,
      venueName: 'Le Liberté',
    });
  });

  it('gives an address no venue name', () => {
    const place = placeFromFeature({ place_type: ['address'], address: '12', text: 'Rue de la Paix', properties: {}, geometry, context });
    expect(place.street).toBe('12 Rue de la Paix');
    expect(place.venueName).toBeUndefined();
  });

  it('takes the country from the region for territories without one', () => {
    const place = placeFromFeature({
      place_type: ['place'],
      text: 'Saint-Denis',
      properties: {},
      geometry,
      context: [{ id: 'region.1', text: 'Réunion', short_code: 're' }],
    });
    expect(place.countryCode).toBe('RE');
  });
});
