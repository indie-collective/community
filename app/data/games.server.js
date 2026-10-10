// Games: every read and write the routes make (#151). The only place that
// knows how games are stored.
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  isNull,
  max,
  notInArray,
  sql,
} from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  gameImages,
  gameOrganizations,
  games,
  gameTags,
  organizations,
  tags,
} from '../db/schema.js';
import { matchesSearch } from '../db/search.js';
import computeGame from '../models/game';
import { refreshIfStale } from '../utils/igdbData.server';
import { logChange } from './changes.server';
import { getUploads } from './images.server';
import * as shape from './shapes.server';
import { resolveTagNames } from './tags.server';

// The games list's orders, by the keys the page offers (routes/games).
const ORDERS = {
  updated: desc(games.updatedAt),
  newest: desc(games.createdAt),
  name: asc(games.name),
};

const notDeleted = isNull(games.deletedAt);

// What game cards show: stored IGDB data, images, tags and organisations.
const CARD_WITH = {
  igdb: true,
  images: { orderBy: [asc(gameImages.position), asc(gameImages.createdAt)] },
  tags: { with: { tag: true } },
  organizations: { with: { organization: true } },
};

/**
 * A game loaded with relations (`images`, `tags`, `organizations`,
 * `events`, `igdb`) in the old shape: `game_image`, `game_tag`,
 * `game_entity` (deleted organisations left out), `game_event` (deleted
 * events left out) and `igdb`, each only when loaded.
 */
export function gameWithRelations(row) {
  if (!row) return row;
  const game = shape.game(row);
  if (row.images) game.game_image = row.images.map(shape.gameImage);
  if (row.tags) {
    game.game_tag = row.tags.map((link) => ({
      game_id: link.gameId,
      tag_id: link.tagId,
      tag: shape.tag(link.tag),
    }));
  }
  if (row.organizations) {
    game.game_entity = row.organizations
      .filter((link) => link.organization && !link.organization.deletedAt)
      .map((link) => ({
        game_id: link.gameId,
        entity_id: link.organizationId,
        role: link.role,
        created_at: link.createdAt,
        entity: shape.organization(link.organization),
      }));
  }
  if (row.events) {
    game.game_event = row.events
      .filter((link) => link.event && !link.event.deletedAt)
      .map((link) => ({
        game_id: link.gameId,
        event_id: link.eventId,
        event: shape.event(link.event),
      }));
  }
  if ('igdb' in row) game.igdb = shape.igdb(row.igdb);
  return game;
}

/** Games made by one of a country's organisations (#258). */
export const madeIn = (countryCode) =>
  exists(
    db
      .select({ one: sql`1` })
      .from(gameOrganizations)
      .innerJoin(
        organizations,
        eq(organizations.id, gameOrganizations.organizationId)
      )
      .where(
        and(
          eq(gameOrganizations.gameId, games.id),
          eq(organizations.countryCode, countryCode),
          isNull(organizations.deletedAt)
        )
      )
  );

const taggedWith = (name) =>
  exists(
    db
      .select({ one: sql`1` })
      .from(gameTags)
      .innerJoin(tags, eq(tags.id, gameTags.tagId))
      .where(and(eq(gameTags.gameId, games.id), eq(tags.name, name)))
  );

/**
 * One page of the games list and the tags of every matching game.
 * `country` keeps games made by one of the country's studios (#258); `q`
 * matches name or about; every tag in `tags` must be on the game.
 *
 * @returns {Promise<{ games: object[], tags: object[] }>} computed games
 *   (see models/game), and tags with their `game_tag` links among the
 *   matches, most used first
 */
export async function listGames({
  page = 1,
  pageSize = 10,
  tags: tagNames = [],
  q = null,
  sort = 'updated',
  country = null,
}) {
  const where = and(
    notDeleted,
    country ? madeIn(country) : undefined,
    q ? matchesSearch(games.searchText, q, { anywhere: true }) : undefined,
    ...tagNames.map(taggedWith)
  );

  const [links, rows] = await Promise.all([
    db
      .select({
        id: tags.id,
        name: tags.name,
        created_at: tags.createdAt,
        updated_at: tags.updatedAt,
        game_id: gameTags.gameId,
      })
      .from(gameTags)
      .innerJoin(tags, eq(tags.id, gameTags.tagId))
      .innerJoin(games, eq(games.id, gameTags.gameId))
      .where(where),
    db.query.games.findMany({
      where,
      // id last, so pages don't overlap when sorted values tie.
      orderBy: [ORDERS[sort] ?? ORDERS.updated, asc(games.id)],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      with: CARD_WITH,
    }),
  ]);

  const byTag = new Map();
  for (const { game_id, ...tag } of links) {
    if (!byTag.has(tag.id)) byTag.set(tag.id, { ...tag, game_tag: [] });
    byTag.get(tag.id).game_tag.push({ game_id, tag_id: tag.id });
  }
  const tagRows = [...byTag.values()].sort(
    (a, b) =>
      b.game_tag.length - a.game_tag.length || a.name.localeCompare(b.name)
  );

  return {
    tags: tagRows,
    games: await Promise.all(rows.map(gameWithRelations).map(computeGame)),
  };
}

/**
 * A game for its page, with its images, tags, studios (with logos), events
 * and stored IGDB data, or null. Stale IGDB data is refreshed after the
 * response (#254), so the page never waits for IGDB.
 */
export async function getGame(id, { context } = {}) {
  const row = await db.query.games.findFirst({
    where: and(eq(games.id, id), notDeleted),
    with: { ...CARD_WITH, events: { with: { event: true } } },
  });
  if (!row) return null;
  const game = gameWithRelations(row);
  refreshIfStale(game, context);
  return computeGame(game);
}

/** A game for its edit form: with its images and tags, or null. */
export async function getGameForEdit(id) {
  const row = await db.query.games.findFirst({
    where: and(eq(games.id, id), notDeleted),
    with: { images: CARD_WITH.images, tags: CARD_WITH.tags },
  });
  return row ? computeGame(gameWithRelations(row)) : null;
}

/** The tag names typed in a form, with aliases resolved to their tags (#207). */
export function resolveGameTags(value) {
  return resolveTagNames(value);
}

// Statements creating the tags named that don't exist yet, and linking the
// game to exactly those tags.
function setTagsStatements(gameId, tagNames, now) {
  const statements = [];
  if (tagNames.length > 0) {
    statements.push(
      db
        .insert(tags)
        .values(tagNames.map((name) => ({ name })))
        .onConflictDoNothing()
    );
  }
  statements.push(
    db
      .delete(gameTags)
      .where(
        and(
          eq(gameTags.gameId, gameId),
          notInArray(
            gameTags.tagId,
            db
              .select({ id: tags.id })
              .from(tags)
              .where(inArray(tags.name, tagNames))
          )
        )
      )
  );
  if (tagNames.length > 0) {
    statements.push(
      db
        .insert(gameTags)
        .select(
          db
            .select({
              gameId: sql`${gameId}`.as('game_id'),
              tagId: tags.id,
              createdAt: sql`${now.getTime()}`.as('created_at'),
            })
            .from(tags)
            .where(inArray(tags.name, tagNames))
        )
        .onConflictDoNothing()
    );
  }
  return statements;
}

/**
 * Creates a game with its tags (names, as resolveGameTags returns them).
 * @returns {Promise<{ id: string }>}
 */
export async function createGame({
  name,
  about,
  site,
  igdbSlug,
  tagNames,
  authorId,
}) {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.batch([
    db.insert(games).values({
      id,
      name,
      about,
      site,
      igdbSlug: igdbSlug ?? null,
      searchText: shape.searchTextOf({ name, about }),
      lastModifiedById: authorId,
      createdAt: now,
      updatedAt: now,
    }),
    ...setTagsStatements(id, tagNames, now),
    logChange('create', 'game', id, authorId),
  ]);
  return { id };
}

/**
 * Updates a game's fields, and sets its tags to exactly `tagNames`.
 * @returns {Promise<{ id: string }>}
 */
export async function updateGame(
  id,
  { name, about, site, igdbSlug, tagNames, authorId }
) {
  const now = new Date();
  await db.batch([
    db
      .update(games)
      .set({
        name,
        about,
        site,
        igdbSlug: igdbSlug ?? null,
        searchText: shape.searchTextOf({ name, about }),
        lastModifiedById: authorId,
        updatedAt: now,
      })
      .where(eq(games.id, id)),
    ...setTagsStatements(id, tagNames, now),
    logChange('update', 'game', id, authorId),
  ]);
  return { id };
}

/** Deletes a game: it's only hidden, and its history stays (ADR 0003). */
export async function deleteGame(id, { authorId = null } = {}) {
  await db.batch([
    db
      .update(games)
      .set({ deletedAt: new Date() })
      .where(and(eq(games.id, id), notDeleted)),
    logChange('delete', 'game', id, authorId),
  ]);
}

/** Credits an organisation on a game; already credited is fine. */
export async function addGameOrganization(gameId, organizationId) {
  await db
    .insert(gameOrganizations)
    .values({ gameId, organizationId })
    .onConflictDoNothing();
}

/** Removes an organisation from a game's credits. */
export async function removeGameOrganization(gameId, organizationId) {
  await db
    .delete(gameOrganizations)
    .where(
      and(
        eq(gameOrganizations.gameId, gameId),
        eq(gameOrganizations.organizationId, organizationId)
      )
    );
}

/** Adds uploaded images (their upload IDs) to a game, after its others. */
export async function addGameImages(gameId, imageIds) {
  const uploads = await getUploads(imageIds);
  if (uploads.length === 0) return;
  const [{ last }] = await db
    .select({ last: max(gameImages.position) })
    .from(gameImages)
    .where(eq(gameImages.gameId, gameId));
  const start = last == null ? 0 : last + 1;
  await db.insert(gameImages).values(
    uploads.map(({ key, width, height }, i) => ({
      gameId,
      key,
      width,
      height,
      position: start + i,
    }))
  );
}

/** Removes images (their IDs, as `game_image[].image_id`) from a game. */
export async function removeGameImages(gameId, imageIds) {
  if (imageIds.length === 0) return;
  await db
    .delete(gameImages)
    .where(
      and(eq(gameImages.gameId, gameId), inArray(gameImages.id, imageIds))
    );
}

/**
 * Games whose name or description matches `q`, for pickers: computed games
 * with only `id` and `name`, at most 10. Empty for an empty query.
 */
export async function searchGames(q, { excludeIds = [] } = {}) {
  const search = matchesSearch(games.searchText, q);
  if (!search) return [];
  const rows = await db
    .select({ id: games.id, name: games.name })
    .from(games)
    .where(and(search, notDeleted, notInArray(games.id, excludeIds)))
    .limit(10);
  return Promise.all(rows.map(computeGame));
}

/** The newest games (the home page), computed; deleted ones left out. */
export async function listNewGames({ limit }) {
  const rows = await db.query.games.findMany({
    where: notDeleted,
    with: CARD_WITH,
    orderBy: desc(games.createdAt),
    limit,
  });
  return Promise.all(rows.map(gameWithRelations).map(computeGame));
}

/** How many games there are, deleted ones left out. */
export async function countGames() {
  const [{ value }] = await db
    .select({ value: count() })
    .from(games)
    .where(notDeleted);
  return value;
}

/** Games made by a country's organisations: how many, and the newest. */
export async function listGamesMadeIn(countryCode, { limit }) {
  const where = and(notDeleted, madeIn(countryCode));
  const [[{ value }], rows] = await Promise.all([
    db.select({ value: count() }).from(games).where(where),
    db.query.games.findMany({
      where,
      orderBy: [desc(games.createdAt), asc(games.id)],
      limit,
      with: {
        images: CARD_WITH.images,
        tags: CARD_WITH.tags,
        organizations: CARD_WITH.organizations,
      },
    }),
  ]);
  return {
    count: value,
    games: await Promise.all(rows.map(gameWithRelations).map(computeGame)),
  };
}
