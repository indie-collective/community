import { describe, expect, it } from 'vitest';

import { countryTable } from './countryTable';

const names = { FR: 'France', JP: 'Japan', CA: 'Canada', BE: 'Belgium' };
const continents = { FR: 'EU', JP: 'AS', CA: 'NA', BE: 'EU' };
const place = (code, ...types) => ({
  country_code: code,
  entity: types.map((type) => ({ type })),
});
const link = (game_id, code) => ({
  game_id,
  entity: { location: { country_code: code } },
});

describe('countryTable', () => {
  const rows = countryTable({
    locations: [
      place('FR', 'studio', 'studio', 'association'),
      place('FR', 'studio'),
      place('JP', 'studio', 'studio', 'studio', 'studio', 'studio'),
      place('CA', 'studio'),
      place('BE', 'association'),
      place('ZZ', 'studio'),
    ],
    gameLinks: [
      link('g1', 'FR'),
      link('g1', 'FR'),
      link('g2', 'FR'),
      link('g3', 'JP'),
      { game_id: 'g4', entity: null },
    ],
    events: [
      { location: { country_code: 'FR' } },
      { location: null },
      { location: { country_code: 'CA' } },
    ],
    names,
    continents,
  });

  it('counts studios, associations, distinct games and events per country', () => {
    expect(rows.find((r) => r.code === 'FR')).toMatchObject({
      name: 'France',
      continent: 'EU',
      studios: 3,
      associations: 1,
      games: 2,
      events: 1,
    });
  });

  it('ranks by scene size, then groups by continent, biggest first in each', () => {
    expect(rows.map((r) => [r.code, r.rank])).toEqual([
      ['FR', 2],
      ['BE', 3],
      ['CA', 4],
      ['JP', 1],
    ]);
  });

  it('skips codes it has no name for', () => {
    expect(rows.some((r) => r.code === 'ZZ')).toBe(false);
  });
});
