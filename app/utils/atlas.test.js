import { describe, expect, it } from 'vitest';

import { gazetteerRows, gridRef, scaleBar } from './atlas';

const bounds = { sw: [-60, -120], ne: [60, 120] };

describe('gridRef', () => {
  it('names the square from the top left', () => {
    expect(gridRef({ latitude: 59, longitude: -119 }, bounds)).toBe('A1');
    expect(gridRef({ latitude: -59, longitude: 119 }, bounds)).toBe('H6');
    expect(gridRef({ latitude: 0, longitude: 1 }, bounds)).toBe('E4');
  });

  it('has none outside the map, or without one', () => {
    expect(gridRef({ latitude: 70, longitude: 0 }, bounds)).toBeNull();
    expect(gridRef({ latitude: 0, longitude: 130 }, bounds)).toBeNull();
    expect(gridRef({ latitude: 0, longitude: 0 }, undefined)).toBeNull();
  });

  it('reads across the antimeridian', () => {
    const pacific = { sw: [-40, 160], ne: [40, -160] };
    expect(gridRef({ latitude: 0, longitude: 170 }, pacific)).toBe('C4');
    expect(gridRef({ latitude: 0, longitude: -170 }, pacific)).toBe('G4');
  });
});

describe('scaleBar', () => {
  it('takes the roundest distance that fits', () => {
    const { km, width } = scaleBar(0, 2);
    expect(km).toBe(2000);
    expect(width).toBeLessThanOrEqual(120);
  });

  it('shortens as the map zooms in, and towards the poles', () => {
    expect(scaleBar(45, 10).km).toBeLessThan(scaleBar(45, 4).km);
    expect(scaleBar(70, 6).km).toBeLessThanOrEqual(scaleBar(0, 6).km);
  });
});

describe('gazetteerRows', () => {
  const at = (city, code, type, name) => ({
    id: name,
    name,
    type,
    location: { city, country_code: code, latitude: 45, longitude: 5 },
  });

  it('lists places alphabetically, with what is there', () => {
    const rows = gazetteerRows(
      [
        at('Lyon', 'FR', 'studio', 'Zinc'),
        at('Berlin', 'DE', 'event', 'Con'),
        at('Lyon', 'FR', 'association', 'Assoc'),
      ],
      bounds
    );
    expect(rows.map((row) => row.city ?? row.item.name)).toEqual([
      'Berlin',
      'Con',
      'Lyon',
      'Assoc',
      'Zinc',
    ]);
    expect(rows[2].counts).toEqual({ studio: 1, association: 1, event: 0 });
    expect(rows[2].ref).toMatch(/^[A-H][1-6]$/);
  });

  it('keeps cities of the same name apart', () => {
    const rows = gazetteerRows(
      [at('Paris', 'FR', 'studio', 'A'), at('Paris', 'US', 'studio', 'B')],
      bounds
    );
    expect(
      rows.filter(({ kind }) => kind === 'place').map(({ code }) => code)
    ).toEqual(['FR', 'US']);
  });
});
