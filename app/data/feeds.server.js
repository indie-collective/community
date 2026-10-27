// What calendars and feeds list (#342).
import { and, desc, eq, exists, gte, isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  eventParticipants,
  events,
  games,
  organizationEvents,
  organizations,
} from '../db/schema.js';
import { madeIn } from './games.server';

// Calendars keep a month of past events, so recent ones don't vanish.
const KEEP_PAST = 30 * 86400000;

const linkedTo = (table, column, value) =>
  exists(
    db
      .select({ one: sql`1` })
      .from(table)
      .where(and(eq(table.eventId, events.id), eq(column, value)))
  );

/**
 * Events for a calendar, as `events` rows, soonest first: from a month ago
 * on, in a country, hosted by an organisation, or attended by a person.
 */
export async function listCalendarEvents({ countryCode, organizationId, attendeeId } = {}) {
  return db
    .select()
    .from(events)
    .where(
      and(
        isNull(events.deletedAt),
        gte(events.endsAt, new Date(Date.now() - KEEP_PAST)),
        countryCode ? eq(events.countryCode, countryCode) : undefined,
        organizationId
          ? linkedTo(organizationEvents, organizationEvents.organizationId, organizationId)
          : undefined,
        attendeeId ? linkedTo(eventParticipants, eventParticipants.personId, attendeeId) : undefined
      )
    )
    .orderBy(events.startsAt)
    .limit(1000);
}

/** An organisation's name, or undefined when it's gone. */
export async function getOrganizationName(id) {
  const [row] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)));
  return row?.name;
}

/** One event for "Add to calendar", or undefined. */
export async function getCalendarEvent(id) {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), isNull(events.deletedAt)));
  return row;
}

/**
 * The newest games, events or organisations (`kind`), optionally in a
 * country: `{ kind, id, slug, name, about, type, createdAt, updatedAt,
 * imageKey }` rows, newest first.
 */
export async function listNewest(kind, { countryCode, limit = 50 } = {}) {
  if (kind === 'game') {
    const rows = await db
      .select()
      .from(games)
      .where(and(isNull(games.deletedAt), countryCode ? madeIn(countryCode) : undefined))
      .orderBy(desc(games.createdAt))
      .limit(limit);
    return rows.map((row) => ({ ...row, kind }));
  }
  const table = kind === 'event' ? events : organizations;
  const rows = await db
    .select()
    .from(table)
    .where(
      and(isNull(table.deletedAt), countryCode ? eq(table.countryCode, countryCode) : undefined)
    )
    .orderBy(desc(table.createdAt))
    .limit(limit);
  return rows.map((row) => ({ ...row, kind }));
}
