import { describe, expect, it } from 'vitest';

import { associationsByCity, citiesOf } from './countryOverview';

const org = (type, city, region) => ({
  name: `${type} in ${city}`,
  type,
  location: { city, region },
});
const studio = (city, region) => org('studio', city, region);
const assoc = (city, region) => org('association', city, region);

describe('citiesOf', () => {
  const summary = (cities) => cities.map(({ orgs, lat, lng, ...city }) => city);

  it('counts organisations per city, most first, ties by name, with the split', () => {
    expect(
      summary(
        citiesOf([
          studio('Lyon', 'Rhône'),
          studio('Paris', 'Île-de-France'),
          assoc('Lyon', 'Rhône'),
          studio('Lille', 'Nord'),
        ])
      )
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
      citiesOf([
        studio('Rennes', 'Brittany'),
        studio('Rennes', 'Ille-et-Vilaine'),
        assoc('Rennes', 'Brittany'),
      ])[0].region
    ).toBe('Brittany');
  });

  it('skips organisations without a city, and allows a missing region', () => {
    expect(
      summary(
        citiesOf([
          studio(null, 'Bavaria'),
          studio('  ', null),
          studio('Berlin', null),
          null,
          { type: 'studio' },
        ])
      )
    ).toEqual([
      { name: 'Berlin', count: 1, studios: 1, associations: 0, region: null },
    ]);
  });

  it("places a city at its organisations' mean position, and lists them", () => {
    const at = (name, type, latitude, longitude) => ({
      id: name,
      name,
      type,
      location: { city: 'Rennes', latitude, longitude },
    });
    const [rennes] = citiesOf([
      at('Pixel', 'association', 48.1, -1.7),
      at('Arcade', 'studio', 48.2, -1.6),
      at('Nowhere', 'studio', null, null),
    ]);
    expect(rennes.lat).toBeCloseTo(48.15);
    expect(rennes.lng).toBeCloseTo(-1.65);
    expect(rennes.orgs.map((o) => o.name)).toEqual([
      'Arcade',
      'Nowhere',
      'Pixel',
    ]);
    expect(citiesOf([studio('Lille', 'Nord')])[0]).toMatchObject({
      lat: null,
      lng: null,
    });
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
