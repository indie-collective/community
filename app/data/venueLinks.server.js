// What events and venues need of each other (#390), apart from
// venues.server so the change log can use it too: which venue an event row
// has, and what a venue's new location does to its upcoming events.
import { and, eq, gte, inArray, isNull } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, venues } from '../db/schema.js';
import { dateToZonedInput, zonedInputToDate } from '../utils/eventTime';
import { timeZoneAt } from '../utils/timeZone.server';

// D1 allows 100 parameters per query.
const CHUNK = 90;

/** `rows` (of `events`) with each one's `venue` (`{ id, slug, name }`), or null. */
export async function withVenues(rows) {
  const ids = [...new Set(rows.map((row) => row.venueId).filter(Boolean))];
  const found = new Map();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = await db
      .select({ id: venues.id, slug: venues.slug, name: venues.name })
      .from(venues)
      .where(and(inArray(venues.id, ids.slice(i, i + CHUNK)), isNull(venues.deletedAt)));
    for (const venue of chunk) found.set(venue.id, venue);
  }
  return rows.map((row) => ({ ...row, venue: found.get(row.venueId) ?? null }));
}

const LOCATION = ['countryCode', 'region', 'city', 'street', 'latitude', 'longitude'];

const pick = (row) => Object.fromEntries(LOCATION.map((key) => [key, row[key] ?? null]));

/**
 * The statements that bring a venue's upcoming events to its new location,
 * for the same batch as the venue's update; none when `before` and `after`
 * are in one place. Past events keep the address they were held at. A new
 * time zone keeps their wall-clock times, as editing an event does (#204).
 */
export async function upcomingEventStatements(venueId, before, after, { authorId = null } = {}) {
  const place = pick(after);
  if (JSON.stringify(pick(before)) === JSON.stringify(place)) return [];
  const rows = await db
    .select({ id: events.id, timeZone: events.timeZone, startsAt: events.startsAt, endsAt: events.endsAt })
    .from(events)
    .where(and(eq(events.venueId, venueId), isNull(events.deletedAt), gte(events.endsAt, new Date())));
  const hasPoint = place.latitude != null && place.longitude != null;
  return rows.map((row) => {
    const timeZone = hasPoint ? timeZoneAt(place.latitude, place.longitude) : row.timeZone;
    const moved = (date) => zonedInputToDate(dateToZonedInput(date, row.timeZone), timeZone);
    return db
      .update(events)
      .set({
        ...place,
        timeZone,
        ...(timeZone === row.timeZone ? {} : { startsAt: moved(row.startsAt), endsAt: moved(row.endsAt) }),
        lastModifiedById: authorId,
      })
      .where(eq(events.id, row.id));
  });
}
