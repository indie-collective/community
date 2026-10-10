// Countries and places (#151, part 2): what the countries table, country
// pages and the places list read. Places are where organisations and
// events are located.
import { db } from '../utils/db.server';
import computeGame from '../models/game';
import getImageLinks from '../utils/imageLinks.server';

/**
 * What the countries table is built from (see utils/countryTable):
 * `locations` as `{ country_code, entity: [{ type }] }`, `gameLinks` (one
 * per game and studio, deleted games left out) as `{ game_id, entity: {
 * location: { country_code } | null } }`, and `events` as `{ location:
 * { country_code } | null }`.
 */
export async function listCountryFacts() {
  const [locations, gameLinks, events] = await Promise.all([
    db.location.findMany({
      select: { country_code: true, entity: { select: { type: true } } },
    }),
    db.game_entity.findMany({
      where: { game: { deleted: false } },
      select: {
        game_id: true,
        entity: { select: { location: { select: { country_code: true } } } },
      },
    }),
    db.event.findMany({
      select: { location: { select: { country_code: true } } },
    }),
  ]);
  return { locations, gameLinks, events };
}

/** The codes of countries where something is placed. */
export async function listCountryCodes() {
  const countries = await db.location.groupBy({ by: ['country_code'] });
  return countries.map(({ country_code }) => country_code);
}

/** How many places (organisations' or events') are in a country. */
export function countPlaces(countryCode) {
  return db.location.count({ where: { country_code: countryCode } });
}

/**
 * A country's page: its organisations (`{ id, name, type, location: {
 * city, region, latitude, longitude } }`), how many games its studios made
 * and the eight newest (computed), and how many events are coming up there
 * and the next three (covers as `{ url, thumbnail_url }`).
 */
export async function getCountryOverview(countryCode) {
  const inCountry = { location: { country_code: countryCode } };
  const gamesMadeHere = {
    deleted: false,
    game_entity: { some: { entity: inCountry } },
  };
  const upcoming = {
    ...inCountry,
    status: { not: 'canceled' },
    ends_at: { gte: new Date() },
  };

  const [orgs, gameCount, recentGames, eventCount, upcomingEvents] =
    await Promise.all([
      db.entity.findMany({
        where: inCountry,
        select: {
          id: true,
          name: true,
          type: true,
          location: {
            select: {
              city: true,
              region: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
      db.game.count({ where: gamesMadeHere }),
      db.game.findMany({
        where: gamesMadeHere,
        orderBy: [{ created_at: 'desc' }, { id: 'asc' }],
        take: 8,
        include: {
          game_image: { include: { image: true } },
          game_tag: { include: { tag: true } },
          game_entity: { include: { entity: true } },
        },
      }),
      db.event.count({ where: upcoming }),
      db.event.findMany({
        where: upcoming,
        include: {
          event_participant: true,
          game_event: { where: { game: { deleted: false } } },
          location: true,
          cover: true,
        },
        orderBy: { starts_at: 'asc' },
        take: 3,
      }),
    ]);

  return {
    orgs,
    gameCount,
    recentGames: await Promise.all(recentGames.map(computeGame)),
    eventCount,
    upcomingEvents: upcomingEvents.map((event) => ({
      ...event,
      cover: event.cover ? getImageLinks(event.cover) : null,
    })),
  };
}

/**
 * Every place with how many organisations and events are there: `{
 * country_code, city, region, _count: { entity, event } }`.
 */
export function listPlaces() {
  return db.location.findMany({
    include: { _count: { select: { entity: true, event: true } } },
  });
}
