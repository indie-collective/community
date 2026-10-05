import { describe, expect, it } from 'vitest';

import { areasOf, distanceKm, layoutCallouts } from './countryAreas';

const city = (name, count, lat, lng, studios = count) => ({
  name,
  count,
  studios,
  associations: count - studios,
  lat,
  lng,
});

describe('areasOf', () => {
  const areas = areasOf([
    city('Paris', 100, 48.86, 2.35, 95),
    city('Montreuil', 5, 48.86, 2.44),
    city('Tourcoing', 18, 50.72, 3.16, 17),
    city('Lille', 12, 50.63, 3.06),
    city('Roubaix', 6, 50.69, 3.18),
    city('Lyon', 50, 45.76, 4.84),
    city('Nowhere', 3, null, null),
  ]);

  it('groups nearby cities into areas named after the biggest', () => {
    expect(areas.map((a) => [a.name, a.cities.map((c) => c.name)])).toEqual([
      ['Paris', ['Paris', 'Montreuil']],
      ['Lyon', ['Lyon']],
      ['Tourcoing', ['Tourcoing', 'Lille', 'Roubaix']],
    ]);
  });

  it('adds up counts and the split, and leaves out cities without coordinates', () => {
    expect(areas[0]).toMatchObject({
      count: 105,
      studios: 100,
      associations: 5,
    });
    expect(areas[2]).toMatchObject({ count: 36, studios: 35, associations: 1 });
    expect(
      areas.flatMap((a) => a.cities).some((c) => c.name === 'Nowhere')
    ).toBe(false);
  });

  it('sits an area at its cities weighted by count', () => {
    expect(areas[0].lng).toBeCloseTo((2.35 * 100 + 2.44 * 5) / 105);
  });

  it('measures distances on the globe', () => {
    expect(
      distanceKm({ lat: 48.86, lng: 2.35 }, { lat: 45.76, lng: 4.84 })
    ).toBeCloseTo(392, -1);
  });
});

describe('layoutCallouts', () => {
  const frame = { middle: 50, top: 0, bottom: 100, gap: 10 };

  it('puts each callout on its side, at its height when there is room', () => {
    expect(
      layoutCallouts(
        [
          { x: 10, y: 20 },
          { x: 90, y: 60 },
        ],
        frame
      )
    ).toEqual([
      { side: 'left', y: 20 },
      { side: 'right', y: 60 },
    ]);
  });

  it('pushes callouts apart and keeps them inside', () => {
    const placed = layoutCallouts(
      [
        { x: 10, y: 95 },
        { x: 20, y: 96 },
        { x: 15, y: 97 },
        { x: 80, y: 5 },
        { x: 70, y: 6 },
      ],
      frame
    );
    for (const side of ['left', 'right']) {
      const ys = placed
        .filter((p) => p.side === side)
        .map((p) => p.y)
        .sort((a, b) => a - b);
      ys.slice(1).forEach((y, i) =>
        expect(y - ys[i]).toBeGreaterThanOrEqual(10)
      );
      ys.forEach(
        (y) =>
          expect(y).toBeLessThanOrEqual(100) &&
          expect(y).toBeGreaterThanOrEqual(0)
      );
    }
  });

  it('keeps the columns within one of each other', () => {
    const placed = layoutCallouts(
      [10, 12, 14, 16, 18, 90].map((x, i) => ({ x, y: i * 15 })),
      frame
    );
    const left = placed.filter((p) => p.side === 'left').length;
    expect(Math.abs(left - (placed.length - left))).toBeLessThanOrEqual(1);
  });
});
