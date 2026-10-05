import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

import { drawCityMap } from './cityMap';

const load = (code) =>
  JSON.parse(fs.readFileSync(`public/maps/${code}.json`, 'utf8'));
const city = (name, lat, lng) => ({ name, lat, lng });
const size = ([, , width, height]) => ({ width, height });
const inside = ([x0, y0, w, h], [x, y]) =>
  x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h;

describe('drawCityMap', () => {
  it('fits mainland France, without insets, when its cities are all there', () => {
    const { viewBox, outline, insets, points } = drawCityMap('FR', load('FR'), [
      city('Paris', 48.86, 2.35),
      city('Rennes', 48.11, -1.68),
      city('Marseille', 43.3, 5.37),
    ]);
    expect(outline).toMatch(/^M/);
    expect(insets).toBeNull();
    expect(Object.keys(points)).toEqual(['Paris', 'Rennes', 'Marseille']);
    for (const xy of Object.values(points))
      expect(inside(viewBox, xy)).toBe(true);
    // Rennes is west of Paris, Marseille south, and Paris sits in the
    // middle third across: the view is mainland France, not France and
    // French Guiana.
    expect(points.Rennes[0]).toBeLessThan(points.Paris[0]);
    expect(points.Marseille[1]).toBeGreaterThan(points.Paris[1]);
    const [x0, , width] = viewBox;
    expect((points.Paris[0] - x0) / width).toBeGreaterThan(1 / 3);
    expect((points.Paris[0] - x0) / width).toBeLessThan(2 / 3);
  });

  it('adds insets when a city is overseas, and places it in one', () => {
    const { viewBox, insets, points } = drawCityMap('FR', load('FR'), [
      city('Paris', 48.86, 2.35),
      city('Saint-Denis', -20.88, 55.45),
    ]);
    expect(viewBox).toEqual([0, 0, 960, 600]);
    expect(insets).toMatch(/^M/);
    expect(inside(viewBox, points['Saint-Denis'])).toBe(true);
  });

  it('fits Japan to its main islands, not its far Pacific ones', () => {
    const { width, height } = size(drawCityMap('JP', load('JP'), []).viewBox);
    expect(height / width).toBeGreaterThan(0.8);
  });

  it('centres countries that cross the antimeridian', () => {
    const { viewBox } = drawCityMap('RU', load('RU'), [
      city('Moscow', 55.76, 37.62),
    ]);
    expect(viewBox[2]).toBeLessThanOrEqual(1000);
    expect(viewBox[0]).toBeGreaterThan(-20);
  });

  it('keeps an outlying city in view', () => {
    // A studio in Longyearbyen, Svalbard (Norway's own data puts Svalbard
    // outside the mainland).
    const { viewBox, points } = drawCityMap('NO', load('NO'), [
      city('Oslo', 59.91, 10.75),
      city('Longyearbyen', 78.22, 15.65),
    ]);
    expect(inside(viewBox, points.Longyearbyen)).toBe(true);
  });

  it('leaves out cities without coordinates', () => {
    expect(
      drawCityMap('DE', load('DE'), [city('Berlin', null, null)]).points
    ).toEqual({});
  });
});

describe('every generated map', () => {
  const codes = JSON.parse(
    fs.readFileSync('app/assets/countryMaps.json', 'utf8')
  );

  it('draws to a finite, non-empty view', () => {
    const broken = codes.filter((code) => {
      const { viewBox, outline } = drawCityMap(code, load(code), []);
      const { width, height } = size(viewBox);
      return !(
        outline &&
        width > 0 &&
        height > 0 &&
        width <= 1000 &&
        height <= 1000
      );
    });
    expect(broken).toEqual([]);
  });
});
