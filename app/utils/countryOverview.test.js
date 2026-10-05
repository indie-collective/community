import { describe, expect, it } from 'vitest';

import { associationsByCity, topCities } from './countryOverview';

const org = (type, city, region) => ({ type, location: { city, region } });
const studio = (city, region) => org('studio', city, region);
const assoc = (city, region) => org('association', city, region);

describe('topCities', () => {
  it('counts organisations per city, most first, ties by name, with the split', () => {
    expect(
      topCities([
        studio('Lyon', 'Rhône'),
        studio('Paris', 'Île-de-France'),
        assoc('Lyon', 'Rhône'),
        studio('Lille', 'Nord'),
      ])
    ).toEqual([
      { name: 'Lyon', count: 2, studios: 1, associations: 1, region: 'Rhône' },
      { name: 'Lille', count: 1, studios: 1, associations: 0, region: 'Nord' },
      {
        name: 'Paris',
        count: 1,
        studios: 1,
        associations: 0,
        region: 'Île-de-France',
      },
    ]);
  });

  it("keeps a city's most common region", () => {
    expect(
      topCities([
        studio('Rennes', 'Brittany'),
        studio('Rennes', 'Ille-et-Vilaine'),
        assoc('Rennes', 'Brittany'),
      ])[0].region
    ).toBe('Brittany');
  });

  it('skips organisations without a city, and allows a missing region', () => {
    expect(
      topCities([
        studio(null, 'Bavaria'),
        studio('  ', null),
        studio('Berlin', null),
        null,
        { type: 'studio' },
      ])
    ).toEqual([
      { name: 'Berlin', count: 1, studios: 1, associations: 0, region: null },
    ]);
  });

  it('keeps the top ten', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      studio(`City ${String(i).padStart(2, '0')}`, null)
    );
    expect(topCities(many)).toHaveLength(10);
    expect(topCities(many, 3).map((c) => c.name)).toEqual([
      'City 00',
      'City 01',
      'City 02',
    ]);
  });
});

describe('associationsByCity', () => {
  const a = (name, city) => ({
    name,
    location: city === undefined ? null : { city },
  });

  it('groups by city, biggest first, names sorted, no city last', () => {
    expect(
      associationsByCity([
        a('Pixel', 'Rennes'),
        a('Nowhere', undefined),
        a('Bit', 'Lyon'),
        a('Arcade', 'Rennes'),
        a('Blank', ''),
      ])
    ).toEqual([
      {
        city: 'Rennes',
        associations: [a('Arcade', 'Rennes'), a('Pixel', 'Rennes')],
      },
      { city: 'Lyon', associations: [a('Bit', 'Lyon')] },
      { city: null, associations: [a('Blank', ''), a('Nowhere', undefined)] },
    ]);
  });
});
