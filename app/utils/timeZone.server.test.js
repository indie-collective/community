import { describe, expect, it } from 'vitest';

import { timeZoneAt } from './timeZone.server';

describe('timeZoneAt', () => {
  it('finds the zone of a place', () => {
    expect(timeZoneAt(48.105, -1.676)).toBe('Europe/Paris'); // Rennes
    expect(timeZoneAt(35.011, 135.768)).toBe('Asia/Tokyo'); // Kyoto
    expect(timeZoneAt(45.5, -73.57)).toBe('America/Toronto'); // Montréal
  });

  it('falls back to the default without coordinates', () => {
    expect(timeZoneAt(null, null)).toBe('Europe/Paris');
    expect(timeZoneAt(Number.NaN, 2)).toBe('Europe/Paris');
  });
});
