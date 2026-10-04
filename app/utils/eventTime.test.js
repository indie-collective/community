import { afterAll, describe, expect, it } from 'vitest';

import { dateToZonedInput, formatEventDate, formatEventRange, zonedInputToDate } from './eventTime';

// #204: event times are shown in the event's own time zone, so the output
// must not depend on the process' time zone (the server's, or the browser's).
const PROCESS_ZONES = ['UTC', 'Europe/Paris', 'Asia/Tokyo', 'America/Los_Angeles'];
const originalTZ = process.env.TZ;
afterAll(() => {
  process.env.TZ = originalTZ;
});

const now = new Date('2026-06-01T12:00:00Z');

describe.each(PROCESS_ZONES)('with the process in %s', (zone) => {
  process.env.TZ = zone;

  it('formats in the event zone, 24-hour, without the current year', () => {
    process.env.TZ = zone;
    // 12:00 UTC is 14:00 in Rennes (CEST) and 21:00 in Kyoto.
    const date = new Date('2026-10-23T12:00:00Z');
    expect(formatEventDate(date, 'Europe/Paris', { now })).toBe('Oct 23, 14:00');
    expect(formatEventDate(date, 'Asia/Tokyo', { now })).toBe('Oct 23, 21:00');
  });

  it('shows the year when it is not the current one', () => {
    process.env.TZ = zone;
    expect(formatEventDate(new Date('2025-05-22T08:00:00Z'), 'Europe/Paris', { now })).toBe('May 22, 2025, 10:00');
    expect(formatEventDate(new Date('2025-05-22T08:00:00Z'), 'Europe/Paris', { now, time: false })).toBe('May 22, 2025');
  });

  it('formats ranges with plain spaces, dropping the repeated day', () => {
    process.env.TZ = zone;
    const start = new Date('2026-10-23T12:00:00Z');
    expect(formatEventRange(start, new Date('2026-10-23T18:00:00Z'), 'Europe/Paris', { now })).toBe('Oct 23, 14:00 – 20:00');
    expect(formatEventRange(start, new Date('2026-10-25T19:00:00Z'), 'Europe/Paris', { now })).toBe('Oct 23, 14:00 – Oct 25, 20:00');
    expect(formatEventRange(start, new Date('2026-10-23T18:00:00Z'), 'Europe/Paris', { now, time: false })).toBe('Oct 23');
    expect(formatEventRange(start, new Date('2026-10-25T19:00:00Z'), 'Europe/Paris', { now, time: false })).toBe('Oct 23 – Oct 25');
  });

  it('reads a form value as wall-clock time in the event zone', () => {
    process.env.TZ = zone;
    expect(zonedInputToDate('2026-10-23T14:00', 'Europe/Paris').toISOString()).toBe('2026-10-23T12:00:00.000Z');
    expect(zonedInputToDate('2026-10-23T14:00', 'Asia/Tokyo').toISOString()).toBe('2026-10-23T05:00:00.000Z');
    // Winter time in Paris is UTC+1.
    expect(zonedInputToDate('2026-01-10T09:30', 'Europe/Paris').toISOString()).toBe('2026-01-10T08:30:00.000Z');
  });

  it('round-trips an instant through the form value unchanged', () => {
    process.env.TZ = zone;
    for (const iso of ['2026-10-23T12:00:00.000Z', '2026-03-29T00:30:00.000Z', '2026-12-31T23:59:00.000Z']) {
      for (const tz of ['Europe/Paris', 'Asia/Tokyo', 'America/New_York']) {
        expect(zonedInputToDate(dateToZonedInput(new Date(iso), tz), tz).toISOString()).toBe(iso);
      }
    }
  });
});

describe('edge cases', () => {
  it('returns an empty string for missing dates', () => {
    expect(formatEventDate(null, 'Europe/Paris')).toBe('');
    expect(dateToZonedInput(null, 'Europe/Paris')).toBe('');
  });

  it('rejects malformed form values', () => {
    expect(zonedInputToDate('', 'Europe/Paris')).toBeNull();
    expect(zonedInputToDate('next tuesday', 'Europe/Paris')).toBeNull();
  });

  it('falls back to the default zone for an unknown one', () => {
    expect(formatEventDate(new Date('2026-10-23T12:00:00Z'), 'Not/AZone', { now })).toBe('Oct 23, 14:00');
  });
});
