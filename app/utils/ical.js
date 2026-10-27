// iCalendar (RFC 5545) for event calendars and "Add to calendar" (#342).
import countryNames from '../assets/countries.json';
import { summarize } from './meta';

const CRLF = '\r\n';

/** Text escaped for an iCalendar value. */
export const escapeText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** A content line folded at 75 octets, continuation lines starting with a space. */
export function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const length = new TextEncoder().encode(char).length;
    // The first line has 75 octets, the next 74 after their leading space.
    if (size + length > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += length;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

/** An instant in UTC, as 20261120T130000Z. */
export const icsDate = (date) =>
  new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Where an event happens, as a line of text. */
export const eventPlace = (event) =>
  [event.street, event.city, event.region, countryNames[event.countryCode] ?? event.countryCode]
    .filter(Boolean)
    .join(', ');

/**
 * An event as a VEVENT. `event` is an `events` row; `url` its page. Times
 * are in UTC, which every calendar shows in its own zone.
 */
export function vevent(event, { url, host }) {
  const lines = [
    'BEGIN:VEVENT',
    // Stable, so a change updates the entry instead of adding one.
    `UID:${event.id}@${host}`,
    `DTSTAMP:${icsDate(event.updatedAt ?? event.createdAt ?? new Date())}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(event.endsAt)}`,
    `SUMMARY:${escapeText(event.name)}`,
    `URL:${url}`,
  ];
  const description = [summarize(event.about, 1000), event.onlineUrl && `Online: ${event.onlineUrl}`, url]
    .filter(Boolean)
    .join('\n\n');
  lines.push(`DESCRIPTION:${escapeText(description)}`);
  const place = eventPlace(event) || (event.attendance === 'online' ? event.onlineUrl ?? 'Online' : '');
  if (place) lines.push(`LOCATION:${escapeText(place)}`);
  if (event.latitude != null && event.longitude != null) lines.push(`GEO:${event.latitude};${event.longitude}`);
  lines.push(`STATUS:${event.status === 'canceled' ? 'CANCELLED' : 'CONFIRMED'}`);
  lines.push('END:VEVENT');
  return lines;
}

/** A calendar named `name` of `events`, as an .ics file's text. */
export function calendar(name, events, { origin, path }) {
  const host = new URL(origin).host;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Indie Collective//Community//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    // Calendar apps check back about every few hours.
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...events.flatMap((event) => vevent(event, { url: `${origin}${path(event)}`, host })),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

/** The response for a calendar. */
export const calendarResponse = (text, { filename, cache = 'public, max-age=3600' } = {}) =>
  new Response(text, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': cache,
      ...(filename ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
    },
  });

/** "Add to Google Calendar" for an event. */
export const googleCalendarUrl = ({ name, startsAt, endsAt, about, place, url }) =>
  `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: name,
    dates: `${icsDate(startsAt)}/${icsDate(endsAt)}`,
    details: [summarize(about, 500), url].filter(Boolean).join('\n\n'),
    location: place ?? '',
  })}`;

/** "Add to Outlook" for an event. */
export const outlookCalendarUrl = ({ name, startsAt, endsAt, about, place, url }) =>
  `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: name,
    startdt: new Date(startsAt).toISOString(),
    enddt: new Date(endsAt).toISOString(),
    body: [summarize(about, 500), url].filter(Boolean).join('\n\n'),
    location: place ?? '',
  })}`;
