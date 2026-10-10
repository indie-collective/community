// Events: every read and write the routes make (#151). The only place that
// knows how events are stored.
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  notInArray,
  sql,
} from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  eventParticipants,
  events,
  gameEvents,
  organizationEvents,
} from '../db/schema.js';
import { matchesSearch } from '../db/search.js';
import computeEvent from '../models/event';
import getImageLinks from '../utils/imageLinks.server';
import { logChange } from './changes.server';
import { gameWithRelations } from './games.server';
import { imageColumns } from './images.server';
import * as shape from './shapes.server';

const notDeleted = isNull(events.deletedAt);

// What event cards show: attendance and games (deleted ones left out).
const CARD_WITH = {
  participants: true,
  games: { with: { game: { columns: { deletedAt: true } } } },
};

const links = (row) => ({
  game_event: row.games
    ?.filter(({ game }) => game && !game.deletedAt)
    .map(({ gameId, eventId }) => ({ game_id: gameId, event_id: eventId })),
  event_participant: row.participants?.map(({ eventId, personId }) => ({
    event_id: eventId,
    person_id: personId,
  })),
});

// An event card in the old shape, cover as `{ url, thumbnail_url }` (not
// computed: the events list's shape).
const withCoverLinks = (row) => {
  const event = { ...shape.event(row), ...links(row) };
  return { ...event, cover: event.cover ? getImageLinks(event.cover) : null };
};

const computeCard = (row) =>
  computeEvent({ ...shape.event(row), ...links(row) });

/**
 * The events list: upcoming events, or a year's (`period` is "upcoming" or
 * a year), optionally in one country; for "upcoming", also the ten latest
 * past events; and the facets (countries with events, years with events).
 *
 * @returns {Promise<{ events, pastEvents, countries, years }>} events with
 *   covers as `{ url, thumbnail_url }`; countries as `{ country_code,
 *   _count }`; years as `{ year: string }`
 */
export async function listEvents({ country = null, period = 'upcoming' }) {
  const now = new Date();
  const inCountry = country ? eq(events.countryCode, country) : undefined;
  let when;
  if (period === 'upcoming') {
    when = gte(events.endsAt, now);
  } else {
    const year = parseInt(period, 10);
    if (!isNaN(year)) {
      when = and(
        gte(events.startsAt, new Date(`${year}-01-01`)),
        lte(events.startsAt, new Date(`${year}-12-31`))
      );
    }
  }

  const [rows, pastRows, countries, years] = await Promise.all([
    db.query.events.findMany({
      where: and(notDeleted, inCountry, when),
      with: CARD_WITH,
      orderBy:
        period === 'upcoming' ? asc(events.startsAt) : desc(events.startsAt),
    }),
    period === 'upcoming'
      ? db.query.events.findMany({
          where: and(notDeleted, inCountry, lt(events.endsAt, now)),
          orderBy: desc(events.startsAt),
          limit: 10,
        })
      : [],
    db
      .select({ country_code: events.countryCode, _count: count() })
      .from(events)
      .where(and(notDeleted, isNotNull(events.countryCode)))
      .groupBy(events.countryCode)
      .orderBy(desc(count())),
    db
      .selectDistinct({
        year: sql`strftime('%Y', ${events.startsAt} / 1000, 'unixepoch')`,
      })
      .from(events)
      .where(notDeleted)
      .orderBy(desc(sql`1`)),
  ]);

  return {
    events: rows.map(withCoverLinks),
    pastEvents: pastRows.map(withCoverLinks),
    countries,
    years: years.map(({ year }) => ({ year: String(year) })),
  };
}

/**
 * An event for its page, computed (see models/event): its hosts (with
 * logos), games (deleted ones left out), attendees (only id, username and
 * avatar: loader data is serialised into the page), cover and location;
 * or null.
 */
export async function getEvent(id) {
  const row = await db.query.events.findFirst({
    where: and(eq(events.id, id), notDeleted),
    with: {
      organizations: { with: { organization: true } },
      games: {
        with: {
          game: {
            with: {
              igdb: true,
              images: { orderBy: (t, { asc }) => [asc(t.position)] },
            },
          },
        },
      },
      participants: {
        with: {
          person: { columns: { id: true, username: true, avatarKey: true } },
        },
      },
    },
  });
  if (!row) return null;

  const event = shape.event(row);
  event.entity_event = row.organizations
    .filter(({ organization }) => organization && !organization.deletedAt)
    .map((link) => ({
      entity_id: link.organizationId,
      event_id: link.eventId,
      entity: shape.organization(link.organization),
    }));
  event.game_event = row.games
    .filter(({ game }) => game && !game.deletedAt)
    .map((link) => ({
      game_id: link.gameId,
      event_id: link.eventId,
      game: gameWithRelations(link.game),
    }));
  event.event_participant = row.participants.map(({ person }) => ({
    person: {
      id: person.id,
      username: person.username,
      avatar: shape.image(person.avatarKey),
    },
  }));
  return computeEvent(event);
}

/** Up to five other events whose names match this one's, computed. */
export async function getRelatedEvents(event) {
  const search = matchesSearch(events.searchText, event.name);
  if (!search) return [];
  const rows = await db.query.events.findMany({
    where: and(search, notDeleted, ne(events.id, event.id)),
    with: CARD_WITH,
    limit: 5,
  });
  return Promise.all(rows.map(computeCard));
}

/**
 * An event for its edit form, or null: its fields, location, and cover as
 * `{ url, thumbnail_url }`.
 */
export async function getEventForEdit(id) {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), notDeleted));
  if (!row) return null;
  const event = shape.event(row);
  return { ...event, cover: event.cover ? getImageLinks(event.cover) : null };
}

/** An event's time zone (#204), or undefined. */
export async function getEventTimeZone(id) {
  const [row] = await db
    .select({ timeZone: events.timeZone })
    .from(events)
    .where(eq(events.id, id));
  return row?.timeZone;
}

/**
 * Creates an event. `location` holds street, city, region, country_code,
 * latitude, longitude; `coverId` is an upload's ID.
 * @returns {Promise<{ id: string }>}
 */
export async function createEvent({
  name,
  status,
  timeZone,
  startsAt,
  endsAt,
  about,
  site,
  coverId,
  location,
  authorId = null,
}) {
  const id = crypto.randomUUID();
  await db.batch([
    db.insert(events).values({
      id,
      name,
      status,
      timeZone,
      startsAt,
      endsAt,
      about,
      site,
      ...shape.locationColumns(location),
      ...(await imageColumns('cover', coverId)),
      searchText: shape.searchTextOf({ name, about }),
      lastModifiedById: authorId,
    }),
    logChange('create', 'event', id, authorId),
  ]);
  return { id };
}

/**
 * Updates an event. Undefined fields, a missing cover or an empty location
 * keep the current value.
 * @returns {Promise<{ id: string }>}
 */
export async function updateEvent(
  id,
  {
    name,
    status,
    timeZone,
    startsAt,
    endsAt,
    about,
    site,
    coverId,
    location,
    authorId,
  }
) {
  const [current] = await db
    .select({ name: events.name, about: events.about })
    .from(events)
    .where(eq(events.id, id));
  await db.batch([
    db
      .update(events)
      .set({
        name,
        lastModifiedById: authorId,
        status,
        timeZone,
        startsAt,
        endsAt,
        about,
        site,
        ...shape.locationColumns(location),
        ...(await imageColumns('cover', coverId)),
        searchText: shape.searchTextOf({
          name: name ?? current?.name,
          about: about === undefined ? current?.about : about,
        }),
      })
      .where(eq(events.id, id)),
    logChange('update', 'event', id, authorId),
  ]);
  return { id };
}

/** Deletes an event: it's only hidden, and its history stays. */
export async function deleteEvent(id, { authorId = null } = {}) {
  await db.batch([
    db
      .update(events)
      .set({ deletedAt: new Date() })
      .where(and(eq(events.id, id), notDeleted)),
    logChange('delete', 'event', id, authorId),
  ]);
}

/** Marks someone as attending; already attending is fine. */
export async function joinEvent(eventId, personId) {
  await db
    .insert(eventParticipants)
    .values({ eventId, personId })
    .onConflictDoNothing();
}

/** Removes someone from an event's attendees. */
export async function leaveEvent(eventId, personId) {
  await db
    .delete(eventParticipants)
    .where(
      and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.personId, personId)
      )
    );
}

/** Lists a game as shown at an event; already listed is fine. */
export async function addEventGame(eventId, gameId) {
  await db.insert(gameEvents).values({ gameId, eventId }).onConflictDoNothing();
}

/** Removes a game from an event. */
export async function removeEventGame(eventId, gameId) {
  await db
    .delete(gameEvents)
    .where(and(eq(gameEvents.eventId, eventId), eq(gameEvents.gameId, gameId)));
}

/** Adds an organisation as a host; already hosting is fine. */
export async function addEventOrganization(eventId, organizationId) {
  await db
    .insert(organizationEvents)
    .values({ organizationId, eventId })
    .onConflictDoNothing();
}

/** Removes an organisation from an event's hosts. */
export async function removeEventOrganization(eventId, organizationId) {
  await db
    .delete(organizationEvents)
    .where(
      and(
        eq(organizationEvents.eventId, eventId),
        eq(organizationEvents.organizationId, organizationId)
      )
    );
}

/**
 * Events whose name or description matches `q`, for pickers: `{ id, name
 * }`, at most `limit`. Empty for an empty query.
 */
export async function searchEvents(q, { excludeIds = [], limit = 10 } = {}) {
  const search = matchesSearch(events.searchText, q);
  if (!search) return [];
  return db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(and(search, notDeleted, notInArray(events.id, excludeIds)))
    .limit(limit);
}

/** The most recently added events (the home page), computed. */
export async function listNewEvents({ limit }) {
  const rows = await db.query.events.findMany({
    where: notDeleted,
    with: CARD_WITH,
    orderBy: desc(events.createdAt),
    limit,
  });
  return Promise.all(rows.map(computeCard));
}

const upcoming = (now) =>
  and(notDeleted, ne(events.status, 'canceled'), gte(events.endsAt, now));

/**
 * Events not over yet and not canceled, soonest first, computed: all of
 * them, or those `attendeeId` attends.
 */
export async function listUpcomingEvents({ limit, attendeeId }) {
  const rows = await db.query.events.findMany({
    where: and(
      upcoming(new Date()),
      attendeeId
        ? exists(
            db
              .select({ one: sql`1` })
              .from(eventParticipants)
              .where(
                and(
                  eq(eventParticipants.eventId, events.id),
                  eq(eventParticipants.personId, attendeeId)
                )
              )
          )
        : undefined
    ),
    with: CARD_WITH,
    orderBy: asc(events.startsAt),
    limit,
  });
  return Promise.all(rows.map(computeCard));
}

/** How many events there are. */
export async function countEvents() {
  const [{ value }] = await db
    .select({ value: count() })
    .from(events)
    .where(notDeleted);
  return value;
}

/**
 * Upcoming events in a country: how many, and the first `limit` (covers as
 * `{ url, thumbnail_url }`).
 */
export async function listUpcomingEventsIn(countryCode, { limit }) {
  const where = and(upcoming(new Date()), eq(events.countryCode, countryCode));
  const [[{ value }], rows] = await Promise.all([
    db.select({ value: count() }).from(events).where(where),
    db.query.events.findMany({
      where,
      with: CARD_WITH,
      orderBy: asc(events.startsAt),
      limit,
    }),
  ]);
  return { count: value, events: rows.map(withCoverLinks) };
}
