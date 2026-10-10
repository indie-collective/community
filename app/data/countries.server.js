// Countries and places (#151): what the countries table, country pages and
// the places list read. Places are where organisations and events are.
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  events,
  gameOrganizations,
  games,
  organizations,
} from '../db/schema.js';
import { listUpcomingEventsIn } from './events.server';
import { listGamesMadeIn } from './games.server';
import { listOrganizationsIn } from './organizations.server';

const orgLive = isNull(organizations.deletedAt);
const eventLive = isNull(events.deletedAt);

/**
 * What the countries table is built from (see utils/countryTable):
 * `locations` as `{ country_code, entity: [{ type }] }` (one per located
 * organisation), `gameLinks` (one per game and studio, deleted games left
 * out) as `{ game_id, entity: { location: { country_code } | null } }`,
 * and `events` as `{ location: { country_code } | null }`.
 */
export async function listCountryFacts() {
  const [orgs, links, eventRows] = await Promise.all([
    db
      .select({
        country_code: organizations.countryCode,
        type: organizations.type,
      })
      .from(organizations)
      .where(and(orgLive, isNotNull(organizations.countryCode))),
    db
      .select({
        game_id: gameOrganizations.gameId,
        country_code: organizations.countryCode,
      })
      .from(gameOrganizations)
      .innerJoin(games, eq(games.id, gameOrganizations.gameId))
      .innerJoin(
        organizations,
        eq(organizations.id, gameOrganizations.organizationId)
      )
      .where(and(isNull(games.deletedAt), orgLive)),
    db
      .select({ country_code: events.countryCode })
      .from(events)
      .where(eventLive),
  ]);
  const place = (country_code) => (country_code ? { country_code } : null);
  return {
    locations: orgs.map(({ country_code, type }) => ({
      country_code,
      entity: [{ type }],
    })),
    gameLinks: links.map(({ game_id, country_code }) => ({
      game_id,
      entity: { location: place(country_code) },
    })),
    events: eventRows.map(({ country_code }) => ({
      location: place(country_code),
    })),
  };
}

// Organisations' and events' places: `{ country_code, city, region,
// created_at, kind }`.
async function placedRecords() {
  const [orgs, eventRows] = await Promise.all([
    db
      .select({
        country_code: organizations.countryCode,
        city: organizations.city,
        region: organizations.region,
        created_at: organizations.createdAt,
      })
      .from(organizations)
      .where(and(orgLive, isNotNull(organizations.countryCode))),
    db
      .select({
        country_code: events.countryCode,
        city: events.city,
        region: events.region,
        created_at: events.createdAt,
      })
      .from(events)
      .where(and(eventLive, isNotNull(events.countryCode))),
  ]);
  return [
    ...orgs.map((row) => ({ ...row, kind: 'entity' })),
    ...eventRows.map((row) => ({ ...row, kind: 'event' })),
  ];
}

/** The codes of countries where something is placed. */
export async function listCountryCodes() {
  const rows = await db.all(sql`
    select country_code from ${organizations}
      where country_code is not null and deleted_at is null
    union
    select country_code from ${events}
      where country_code is not null and deleted_at is null
  `);
  return rows.map(({ country_code }) => country_code);
}

/** How many organisations and events are placed in a country. */
export async function countPlaces(countryCode) {
  const [row] = await db.all(sql`
    select
      (select count(*) from ${organizations}
        where country_code = ${countryCode} and deleted_at is null)
      + (select count(*) from ${events}
        where country_code = ${countryCode} and deleted_at is null) as places
  `);
  return row.places;
}

/**
 * A country's page: its organisations (`{ id, name, type, location: {
 * city, region, latitude, longitude } }`), how many games its studios made
 * and the eight newest (computed), and how many events are coming up there
 * and the next three (covers as `{ url, thumbnail_url }`).
 */
export async function getCountryOverview(countryCode) {
  const [orgs, made, upcoming] = await Promise.all([
    listOrganizationsIn(countryCode),
    listGamesMadeIn(countryCode, { limit: 8 }),
    listUpcomingEventsIn(countryCode, { limit: 3 }),
  ]);
  return {
    orgs,
    gameCount: made.count,
    recentGames: made.games,
    eventCount: upcoming.count,
    upcomingEvents: upcoming.events,
  };
}

/**
 * Every place (a country, city and region) with how many organisations and
 * events are there: `{ country_code, city, region, _count: { entity,
 * event } }`.
 */
export async function listPlaces() {
  const places = new Map();
  for (const { country_code, city, region, kind } of await placedRecords()) {
    const key = [country_code, city, region].join('\n');
    if (!places.has(key)) {
      places.set(key, {
        country_code,
        city,
        region,
        _count: { entity: 0, event: 0 },
      });
    }
    places.get(key)._count[kind] += 1;
  }
  return [...places.values()];
}

/**
 * The places that gained an organisation or event between `from` and
 * `to`, with every organisation and event there: `{ city, country_code,
 * total }`.
 */
export async function listPlacesGrowingBetween(from, to) {
  const places = new Map();
  for (const { country_code, city, created_at } of await placedRecords()) {
    const key = [country_code, city].join('\n');
    if (!places.has(key))
      places.set(key, { city, country_code, total: 0, grew: false });
    const place = places.get(key);
    place.total += 1;
    if (created_at >= from && created_at <= to) place.grew = true;
  }
  return [...places.values()]
    .filter(({ grew }) => grew)
    .map(({ city, country_code, total }) => ({ city, country_code, total }));
}
