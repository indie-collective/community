import { and, inArray, isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events } from '../db/schema.js';
import { zonedInputToDate } from '../utils/eventTime';
import { createEvent } from './events.server';
import { addSource } from './sources.server';

/**
 * Events added in bulk from a reviewed import file (app/data/imports): each
 * through createEvent, as if typed in the event form, so it gets its slug,
 * its search text, its time zone and its line in the moderation log.
 *
 * An event whose name is already on the site is skipped, so an import can be
 * run again safely. `previous` links an edition to the one before it: an
 * event already on the site (`id`), or one in the same file (`key`).
 */

// Daily hours aren't in the sources: the first day from 10:00, the last
// until 18:00, in the event's own time zone.
const OPENS = '10:00';
const CLOSES = '18:00';

const zoneOf = (event) => event.online ?? event.place?.time_zone;

/** What importing `file` would do: each event, new or already there. */
export async function planEventImport(file) {
  const names = file.events.map((event) => event.name.toLowerCase());
  const previousIds = file.events.map((event) => event.previous?.id).filter(Boolean);
  const [existing, previous] = await Promise.all([
    db
      .select({ id: events.id, slug: events.slug, name: events.name })
      .from(events)
      .where(and(isNull(events.deletedAt), inArray(sql`lower(${events.name})`, names))),
    previousIds.length
      ? db
          .select({ id: events.id, slug: events.slug, name: events.name })
          .from(events)
          .where(and(isNull(events.deletedAt), inArray(events.id, previousIds)))
      : [],
  ]);
  const byName = new Map(existing.map((row) => [row.name.toLowerCase(), row]));
  const byId = new Map(previous.map((row) => [row.id, row]));

  return file.events.map((event) => {
    const already = byName.get(event.name.toLowerCase()) ?? null;
    const before = event.previous?.id ? byId.get(event.previous.id) ?? null : null;
    return {
      ...event,
      timeZone: zoneOf(event),
      existing: already,
      // An edition before it that isn't on the site (any more) is dropped.
      previousOnSite: before,
      missingPrevious: Boolean(event.previous?.id && !before),
    };
  });
}

/**
 * Imports `file`'s new events in order, by `authorId`. Returns what was
 * created and what was skipped.
 */
export async function runEventImport(file, { authorId }) {
  const plan = await planEventImport(file);
  const idOfKey = new Map(
    plan.filter((event) => event.existing).map((event) => [event.key, event.existing.id])
  );
  const created = [];
  const skipped = [];

  for (const event of plan) {
    if (event.existing) {
      skipped.push({ key: event.key, name: event.name, slug: event.existing.slug });
      continue;
    }
    const timeZone = event.timeZone;
    const previousEditionId = event.previous?.key
      ? idOfKey.get(event.previous.key) ?? null
      : event.previousOnSite?.id ?? null;
    const { place } = event;
    const { id, slug } = await createEvent({
      name: event.name,
      status: 'ongoing',
      timeZone,
      startsAt: zonedInputToDate(`${event.start}T${OPENS}`, timeZone),
      endsAt: zonedInputToDate(`${event.end}T${CLOSES}`, timeZone),
      about: event.about,
      site: event.site ?? null,
      attendance: event.online ? 'online' : 'in_person',
      onlineUrl: event.onlineUrl ?? null,
      previousEditionId,
      location: place && {
        street: place.street,
        city: place.city,
        region: place.region,
        country_code: place.country_code,
        latitude: place.latitude,
        longitude: place.longitude,
      },
      authorId,
    });
    // #338: where it came from, to read again and fill in.
    if (event.source) await addSource('event', id, event.source);
    idOfKey.set(event.key, id);
    created.push({ key: event.key, name: event.name, slug });
  }
  return { created, skipped };
}
