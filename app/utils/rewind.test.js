import { describe, expect, it } from 'vitest';

import { FIRST_REWIND_YEAR, latestRewindYear, rewindYear } from './rewind';

describe('latestRewindYear', () => {
  it('is last year until December', () => {
    expect(latestRewindYear(new Date('2026-10-28T12:00:00Z'))).toBe(2025);
    expect(latestRewindYear(new Date('2026-01-01T00:00:00Z'))).toBe(2025);
  });

  it('is this year in December', () => {
    expect(latestRewindYear(new Date('2026-12-01T00:00:00Z'))).toBe(2026);
  });
});

describe('rewindYear', () => {
  const now = new Date('2026-10-28T12:00:00Z');

  it('accepts the years with a rewind', () => {
    expect(rewindYear('2025', now)).toBe(2025);
    expect(rewindYear(String(FIRST_REWIND_YEAR), now)).toBe(FIRST_REWIND_YEAR);
  });

  it('refuses years not yet over, too early, or not years', () => {
    expect(rewindYear('2026', now)).toBeNull();
    expect(rewindYear(String(FIRST_REWIND_YEAR - 1), now)).toBeNull();
    expect(rewindYear('20x5', now)).toBeNull();
    expect(rewindYear(undefined, now)).toBeNull();
  });
});
