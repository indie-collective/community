import { describe, expect, it } from 'vitest';

import { topCities } from './countryOverview';

const at = (city, region) => ({ city, region });

describe('topCities', () => {
  it('counts organisations per city, most first, ties by name', () => {
    expect(
      topCities([at('Lyon', 'Rhône'), at('Paris', 'Île-de-France'), at('Lyon', 'Rhône'), at('Lille', 'Nord')])
    ).toEqual([
      { name: 'Lyon', count: 2, region: 'Rhône' },
      { name: 'Lille', count: 1, region: 'Nord' },
      { name: 'Paris', count: 1, region: 'Île-de-France' },
    ]);
  });

  it("keeps a city's most common region", () => {
    expect(topCities([at('Rennes', 'Brittany'), at('Rennes', 'Ille-et-Vilaine'), at('Rennes', 'Brittany')])).toEqual([
      { name: 'Rennes', count: 3, region: 'Brittany' },
    ]);
  });

  it('skips places without a city, and allows a missing region', () => {
    expect(topCities([at(null, 'Bavaria'), at('  ', null), at('Berlin', null), null])).toEqual([
      { name: 'Berlin', count: 1, region: null },
    ]);
  });

  it('keeps the top ten', () => {
    const many = Array.from({ length: 12 }, (_, i) => at(`City ${String(i).padStart(2, '0')}`, null));
    expect(topCities(many)).toHaveLength(10);
    expect(topCities(many, 3).map((c) => c.name)).toEqual(['City 00', 'City 01', 'City 02']);
  });
});
