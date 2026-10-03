import { describe, expect, it } from 'vitest';

import { geocodingUrl, placeNames } from './geocoding';

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
