import { describe, expect, it } from 'vitest';

import { calendar, escapeText, fold, googleCalendarUrl, icsDate } from './ical';

const event = {
  id: 'e1',
  name: 'Stunfest, 2026; the big one',
  about: 'A **festival**\nin Rennes.',
  startsAt: new Date('2026-11-20T13:00:00Z'),
  endsAt: new Date('2026-11-22T18:30:00Z'),
  updatedAt: new Date('2026-10-01T10:00:00Z'),
  status: 'ongoing',
  street: '4bis Cours des Alliés',
  city: 'Rennes',
  countryCode: 'FR',
  latitude: 48.105,
  longitude: -1.676,
};
const options = { origin: 'https://community.indieco.xyz', path: (e) => `/event/${e.id}` };

describe('calendar', () => {
  const ics = calendar('Indie events', [event], options);
  const unfolded = ics.replace(/\r\n /g, '');

  it('is a VCALENDAR with CRLF line ends', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
  });

  it('gives each event a stable UID, UTC times, its place and link', () => {
    expect(unfolded).toContain('UID:e1@community.indieco.xyz');
    expect(unfolded).toContain('DTSTART:20261120T130000Z');
    expect(unfolded).toContain('DTEND:20261122T183000Z');
    expect(unfolded).toContain('SUMMARY:Stunfest\\, 2026\; the big one');
    expect(unfolded).toContain('LOCATION:4bis Cours des Alliés\\, Rennes\\, France');
    expect(unfolded).toContain('GEO:48.105;-1.676');
    expect(unfolded).toContain('URL:https://community.indieco.xyz/event/e1');
    expect(unfolded).toContain('STATUS:CONFIRMED');
  });

  it('marks canceled events', () => {
    expect(calendar('x', [{ ...event, status: 'canceled' }], options)).toContain('STATUS:CANCELLED');
  });

  it('keeps lines within 75 octets', () => {
    const long = calendar('x', [{ ...event, about: 'é'.repeat(300) }], options);
    for (const line of long.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('fold', () => {
  it('leaves short lines alone and never splits a character', () => {
    expect(fold('SUMMARY:short')).toBe('SUMMARY:short');
    const folded = fold(`DESCRIPTION:${'日本'.repeat(40)}`);
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'日本'.repeat(40)}`);
  });
});

it('escapes text and formats dates', () => {
  expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\;c\\\\d\\ne');
  expect(icsDate('2026-01-02T03:04:05.678Z')).toBe('20260102T030405Z');
});

it('builds a Google Calendar link', () => {
  const url = new URL(googleCalendarUrl({ ...event, url: 'https://x/event/e1', place: 'Rennes' }));
  expect(url.searchParams.get('dates')).toBe('20261120T130000Z/20261122T183000Z');
  expect(url.searchParams.get('text')).toBe(event.name);
});
