// Gaps in the data (#151), for the admin page that lists what needs
// filling in.
import { and, desc, eq, isNull, notExists, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  gameImages,
  gameOrganizations,
  games,
  gameTags,
  organizations,
} from '../db/schema.js';

const without = (table, column, id) =>
  notExists(
    db
      .select({ one: sql`1` })
      .from(table)
      .where(eq(column, id))
  );

const newestFirst = (table, ...conditions) =>
  db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(and(isNull(table.deletedAt), ...conditions))
    .orderBy(desc(table.createdAt));

/**
 * Games without images, organisations or tags, and organisations without
 * games or a location; each as `{ id, name }`, newest first.
 */
export async function listMissingData() {
  const [
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  ] = await Promise.all([
    newestFirst(games, without(gameImages, gameImages.gameId, games.id)),
    newestFirst(
      games,
      without(gameOrganizations, gameOrganizations.gameId, games.id)
    ),
    newestFirst(games, without(gameTags, gameTags.gameId, games.id)),
    newestFirst(
      organizations,
      without(
        gameOrganizations,
        gameOrganizations.organizationId,
        organizations.id
      )
    ),
    newestFirst(organizations, isNull(organizations.countryCode)),
  ]);
  return {
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  };
}
