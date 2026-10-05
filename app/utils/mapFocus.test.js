import { describe, expect, it } from 'vitest';

import { focusOn, zoomToFit } from './mapFocus';

const at = (latitude, longitude) => ({ latitude, longitude });

describe('focusOn', () => {
  it('boxes the points and centres on the box', () => {
    expect(focusOn([at(43, -1), at(51, 7), at(48, 2)])).toEqual({
      sw: [43, -1],
      ne: [51, 7],
      center: [47, 3],
    });
  });

  it('leaves out far-off outliers once there are enough points', () => {
    // Twenty places in mainland France, and one in Réunion.
    const mainland = Array.from({ length: 20 }, (_, i) =>
      at(43 + (i % 8), -1 + (i % 9))
    );
    const { sw, ne } = focusOn([...mainland, at(-21, 55.5)]);
    expect(sw[0]).toBeGreaterThan(40);
    expect(ne[1]).toBeLessThan(10);
  });

  it('ignores places without coordinates, and gives nothing for none', () => {
    expect(focusOn([at(null, 2), at(48, 2)]).center).toEqual([48, 2]);
    expect(focusOn([at(null, null)])).toBeNull();
  });
});

describe('zoomToFit', () => {
  it('zooms to a country on a 1240 × 835 map', () => {
    const france = zoomToFit(
      { sw: [43, -1.7], ne: [50.7, 7.5] },
      { width: 1240, height: 835 }
    );
    expect(france).toBeGreaterThan(4.5);
    expect(france).toBeLessThan(6.5);
  });

  it('zooms out further for a bigger area, and caps a single place', () => {
    const small = zoomToFit(
      { sw: [43, -1.7], ne: [50.7, 7.5] },
      { width: 1240, height: 835 }
    );
    const big = zoomToFit(
      { sw: [25, -124], ne: [49, -67] },
      { width: 1240, height: 835 }
    );
    expect(big).toBeLessThan(small);
    expect(
      zoomToFit({ sw: [48, 2], ne: [48, 2] }, { width: 1240, height: 835 })
    ).toBe(12);
  });
});
