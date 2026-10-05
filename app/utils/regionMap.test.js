import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  classify,
  classLabels,
  classOf,
  countByRegion,
  drawRegions,
  regionsOf,
} from './regionMap';

const load = (code) =>
  regionsOf(JSON.parse(fs.readFileSync(`public/maps/${code}.json`, 'utf8')));

describe('countByRegion', () => {
  const france = load('FR');
  const countIn = (points) => {
    const { counts, unplaced } = countByRegion(france, points);
    return {
      unplaced,
      regions: Object.fromEntries(
        france
          .map((r, i) => [r.properties.name, counts[i]])
          .filter(([, n]) => n)
      ),
    };
  };

  it('places organisations in their region by coordinates', () => {
    expect(
      countIn([
        { lng: -1.68, lat: 48.11, count: 3 }, // Rennes
        { lng: 2.35, lat: 48.86, count: 5 }, // Paris
        { lng: 55.45, lat: -20.88 }, // Saint-Denis, Réunion
      ])
    ).toEqual({
      unplaced: 0,
      regions: { Brittany: 3, 'Île-de-France': 5, Réunion: 1 },
    });
  });

  it('keeps coastal cities that simplified borders leave just offshore', () => {
    // Marseille's Vieux-Port and Brest's harbour.
    expect(
      countIn([
        { lng: 5.365, lat: 43.295 },
        { lng: -4.49, lat: 48.38 },
      ]).regions
    ).toEqual({
      "Provence-Alpes-Côte d'Azur": 1,
      Brittany: 1,
    });
  });

  it('leaves out points far from any region, and points without coordinates', () => {
    expect(
      countIn([
        { lng: -30, lat: 45 },
        { lng: null, lat: 48, count: 2 },
      ])
    ).toEqual({ unplaced: 3, regions: {} });
  });
});

describe('classes', () => {
  it('breaks non-zero counts into up to five quantile classes', () => {
    const bounds = classify([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 113]);
    expect(bounds).toEqual([1, 3, 8, 21, 113]);
    expect(classLabels(bounds)).toEqual(['1', '2–3', '4–8', '9–21', '22–113']);
    expect([0, 1, 2, 9, 113].map((n) => classOf(n, bounds))).toEqual([
      0, 1, 2, 4, 5,
    ]);
  });

  it('uses fewer classes when there are few distinct counts', () => {
    expect(classify([2, 2, 2, 7])).toEqual([2, 7]);
    expect(classify([0, 0])).toEqual([]);
  });
});

describe('drawRegions', () => {
  it('draws France with insets for its overseas regions', () => {
    const france = load('FR');
    const { viewBox, paths, insets } = drawRegions('FR', france);
    expect(paths).toHaveLength(france.length);
    expect(paths.every((d) => d?.startsWith('M'))).toBe(true);
    expect(viewBox).toBe('0 0 960 600');
    expect(insets).toMatch(/^M/);
  });

  it('fits Japan to its main islands, not its far Pacific ones', () => {
    const [, , width, height] = drawRegions('JP', load('JP'))
      .viewBox.split(' ')
      .map(Number);
    // Honshu and its neighbours run diagonally: the view is about as tall as
    // it is wide. With the Pacific islands it was mostly empty ocean.
    expect(height / width).toBeGreaterThan(0.8);
  });

  it('centres countries that cross the antimeridian', () => {
    const [x, , width] = drawRegions('RU', load('RU'))
      .viewBox.split(' ')
      .map(Number);
    // Fitted into 960 wide, not split across both edges of the world.
    expect(width).toBeLessThanOrEqual(980);
    expect(x).toBeGreaterThan(-20);
  });
});

describe('every generated map', () => {
  const codes = JSON.parse(fs.readFileSync('app/assets/countryMaps.json', 'utf8'));

  it('draws to a finite, non-empty view with a path per region', () => {
    const broken = codes.filter((code) => {
      const regions = load(code);
      const { viewBox, paths } = drawRegions(code, regions);
      const [, , width, height] = viewBox.split(' ').map(Number);
      return !(width > 0 && height > 0 && Number.isFinite(width + height) && width <= 1000 && height <= 1000)
        || paths.length !== regions.length;
    });
    expect(broken).toEqual([]);
  });
});
