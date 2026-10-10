// The year in review (#151): what /rewind counts.
import { and, between, count, desc, eq, isNull } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, gameTags, organizations, tags } from '../db/schema.js';
import { listPlacesGrowingBetween } from './countries.server';

/**
 * A year's numbers: events held, games, studios and associations added,
 * the five most used tags on its new games (`{ name, count }`), and the
 * five places with the most organisations and events (`{ city, country,
 * total }`) among those that gained one that year.
 */
export async function getYearInReview(year) {
  const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59Z`);

  const countOf = async (table, where) =>
    (await db.select({ value: count() }).from(table).where(where))[0].value;
  const organizationsOfType = (type) =>
    countOf(
      organizations,
      and(
        isNull(organizations.deletedAt),
        eq(organizations.type, type),
        between(organizations.createdAt, startOfYear, endOfYear)
      )
    );

  const [
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags,
    places,
  ] = await Promise.all([
    countOf(
      events,
      and(
        isNull(events.deletedAt),
        between(events.startsAt, startOfYear, endOfYear)
      )
    ),
    countOf(
      games,
      and(
        isNull(games.deletedAt),
        between(games.createdAt, startOfYear, endOfYear)
      )
    ),
    organizationsOfType('studio'),
    organizationsOfType('association'),
    db
      .select({ name: tags.name, count: count() })
      .from(gameTags)
      .innerJoin(tags, eq(tags.id, gameTags.tagId))
      .innerJoin(games, eq(games.id, gameTags.gameId))
      .where(between(games.createdAt, startOfYear, endOfYear))
      .groupBy(tags.id)
      .orderBy(desc(count()))
      .limit(5),
    listPlacesGrowingBetween(startOfYear, endOfYear),
  ]);

  return {
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags,
    topLocations: places
      .map(({ city, country_code, total }) => ({
        city: city || 'Unknown',
        country: country_code,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
  };
}
