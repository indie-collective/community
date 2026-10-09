// Events: every read and write the routes make (#151, part 2). The only
// place that knows how events are stored; the D1 port reimplements these
// functions with the same results.
import { db } from '../utils/db.server';
import computeEvent from '../models/event';
import getImageLinks from '../utils/imageLinks.server';
import { getFullTextSearchQuery } from '../utils/search.server';

const withCoverLinks = (event) => ({
  ...event,
  cover: event.cover ? getImageLinks(event.cover) : null,
});

/**
 * The events list: upcoming events, or a year's (`period` is "upcoming" or
 * a year), optionally in one country; for "upcoming", also the ten latest
 * past events; and the facets (countries with events, years with events).
 *
 * @returns {Promise<{ events, pastEvents, countries, years }>} events with
 *   covers as `{ url, thumbnail_url }`; years as `{ year: string }`
 */
export async function listEvents({ country = null, period = 'upcoming' }) {
  const where = {};
  if (country) where.location = { country_code: country };
  if (period === 'upcoming') {
    where.ends_at = { gte: new Date() };
  } else {
    const year = parseInt(period, 10);
    if (!isNaN(year)) {
      where.starts_at = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }
  }

  const events = (
    await db.event.findMany({
      where,
      include: {
        event_participant: true,
        game_event: { where: { game: { deleted: false } } },
        location: true,
        cover: true,
      },
      orderBy: { starts_at: period === 'upcoming' ? 'asc' : 'desc' },
    })
  ).map(withCoverLinks);

  const pastEvents =
    period === 'upcoming'
      ? (
          await db.event.findMany({
            where: {
              ends_at: { lt: new Date() },
              ...(country ? { location: { country_code: country } } : {}),
            },
            include: { location: true, cover: true },
            orderBy: { starts_at: 'desc' },
            take: 10,
          })
        ).map(withCoverLinks)
      : [];

  const countries = await db.location.groupBy({
    by: ['country_code'],
    where: { event: { some: {} } },
    _count: true,
    orderBy: { _count: { country_code: 'desc' } },
  });

  // EXTRACT returns numeric, which Prisma hands back as a Decimal: strings
  // render.
  const years = (
    await db.$queryRaw`
      SELECT DISTINCT EXTRACT(YEAR FROM starts_at) as year
      FROM event
      ORDER BY year DESC
    `
  ).map(({ year }) => ({ year: String(year) }));

  return { events, pastEvents, countries, years };
}

/**
 * An event for its page, computed (see models/event): its hosts (with
 * logos), games (deleted ones left out), attendees (only id, username and
 * avatar: loader data is serialised into the page), cover and location;
 * or null.
 */
export async function getEvent(id) {
  const event = await db.event.findUnique({
    where: { id },
    include: {
      entity_event: { include: { entity: { include: { logo: true } } } },
      game_event: {
        where: { game: { deleted: false } },
        include: {
          game: {
            include: { igdb: true, game_image: { include: { image: true } } },
          },
        },
      },
      event_participant: {
        select: {
          person: { select: { id: true, username: true, avatar: true } },
        },
      },
      cover: true,
      location: true,
    },
  });
  return event ? computeEvent(event) : null;
}

/** Up to five other events whose names match this one's, computed. */
export async function getRelatedEvents(event) {
  const search = getFullTextSearchQuery(event.name);
  if (!search) return [];
  const related = await db.event.findMany({
    where: { name: { search }, id: { not: event.id } },
    include: {
      cover: true,
      game_event: { where: { game: { deleted: false } } },
      event_participant: true,
    },
    take: 5,
  });
  return Promise.all(related.map(computeEvent));
}

/**
 * An event for its edit form, or null: its fields, location, and cover as
 * `{ url, thumbnail_url }`.
 */
export async function getEventForEdit(id) {
  const event = await db.event.findUnique({
    where: { id },
    include: { cover: true, location: true },
  });
  if (!event) return null;
  return {
    ...event,
    cover: event.cover
      ? {
          url: `https://${process.env.CDN_HOST}/${event.cover.image_file.name}`,
          thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${event.cover.image_file.name}`,
        }
      : null,
  };
}

/** An event's time zone (#204), or undefined. */
export async function getEventTimeZone(id) {
  return (
    await db.event.findUnique({ where: { id }, select: { time_zone: true } })
  )?.time_zone;
}

// The location fields as a Prisma relation input: the same place is
// reused rather than duplicated; none when every field is empty.
function locationInput(location) {
  if (!location || !Object.values(location).some((value) => value !== null))
    return undefined;
  return {
    connectOrCreate: {
      where: { street_city_region_country_code_latitude_longitude: location },
      create: location,
    },
  };
}

/**
 * Creates an event. `location` holds street, city, region, country_code,
 * latitude, longitude; `coverId` is an uploaded image's ID.
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
}) {
  return db.event.create({
    data: {
      name,
      status,
      time_zone: timeZone,
      starts_at: startsAt,
      ends_at: endsAt,
      about,
      site,
      cover: coverId ? { connect: { id: coverId } } : undefined,
      location: locationInput(location),
    },
    select: { id: true },
  });
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
  return db.event.update({
    where: { id },
    data: {
      name,
      lastModifiedById: authorId,
      status,
      time_zone: timeZone,
      starts_at: startsAt,
      ends_at: endsAt,
      about,
      site,
      cover: coverId ? { connect: { id: coverId } } : undefined,
      location: locationInput(location),
    },
    select: { id: true },
  });
}

/** Deletes an event. */
export async function deleteEvent(id) {
  await db.event.delete({ where: { id } });
}

/** Marks someone as attending; already attending is fine. */
export async function joinEvent(eventId, personId) {
  await db.event_participant.upsert({
    where: { event_id_person_id: { event_id: eventId, person_id: personId } },
    create: { event_id: eventId, person_id: personId },
    update: {},
  });
}

/** Removes someone from an event's attendees. */
export async function leaveEvent(eventId, personId) {
  await db.event_participant.delete({
    where: { event_id_person_id: { event_id: eventId, person_id: personId } },
  });
}

/** Lists a game as shown at an event; already listed is fine. */
export async function addEventGame(eventId, gameId) {
  await db.game_event.upsert({
    where: { game_id_event_id: { game_id: gameId, event_id: eventId } },
    create: { game_id: gameId, event_id: eventId },
    update: {},
  });
}

/** Removes a game from an event. */
export async function removeEventGame(eventId, gameId) {
  await db.game_event.delete({
    where: { game_id_event_id: { game_id: gameId, event_id: eventId } },
  });
}

/** Adds an organisation as a host; already hosting is fine. */
export async function addEventOrganization(eventId, organizationId) {
  await db.entity_event.upsert({
    where: {
      entity_id_event_id: { entity_id: organizationId, event_id: eventId },
    },
    create: { entity_id: organizationId, event_id: eventId },
    update: {},
  });
}

/** Removes an organisation from an event's hosts. */
export async function removeEventOrganization(eventId, organizationId) {
  await db.entity_event.delete({
    where: {
      entity_id_event_id: { entity_id: organizationId, event_id: eventId },
    },
  });
}

/**
 * Events whose name matches `q`, for pickers: `{ id, name }`, at most
 * `limit`. Empty for an empty query.
 */
export async function searchEvents(q, { excludeIds = [], limit = 10 } = {}) {
  const search = getFullTextSearchQuery(q);
  if (!search) return [];
  return db.event.findMany({
    where: { name: { search }, id: { notIn: excludeIds } },
    select: { id: true, name: true },
    take: limit,
  });
}
