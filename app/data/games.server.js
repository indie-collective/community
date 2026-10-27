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
  GAME_ORGANIZATION_ROLES,
  gameImages,
  gameMilestones,
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
import { searchIndex } from './search.server';
import * as shape from './shapes.server';
import { resolveTagNames } from './tags.server';
import { freeSlug, renameSlugStatements } from './slugs.server';
import { slugify } from '../utils/slug';

// The games list's orders, by the keys the page offers (routes/games).
const ORDERS = {
  updated: desc(games.updatedAt),
  newest: desc(games.createdAt),
  name: asc(games.name),
};

const notDeleted = isNull(games.deletedAt);

// Rows in the order of `ids` (as search ranked them), missing ones left out.
const inOrder = (ids, rows) => {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

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
  if (row.milestones) game.game_milestone = row.milestones.map(shape.gameMilestone);
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
    with: {
      ...CARD_WITH,
      events: { with: { event: true } },
      milestones: { orderBy: [asc(gameMilestones.date)] },
    },
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
  const slug = await freeSlug('game', slugify(name));
  await db.batch([
    db.insert(games).values({
      id,
      name,
      slug,
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
  return { id, slug };
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
  const [current] = await db
    .select({ slug: games.slug })
    .from(games)
    .where(eq(games.id, id));
  const slug = await freeSlug('game', slugify(name), { recordId: id });
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
    ...renameSlugStatements('game', id, current?.slug, slug),
    logChange('update', 'game', id, authorId),
  ]);
  return { id, slug };
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

/**
 * Credits an organisation on a game. An organisation can take part in more
 * than one way (#335): without a `role`, it's credited as the developer, or
 * else in the first role it doesn't have yet (publisher next). Already
 * credited in that role is fine.
 */
export async function addGameOrganization(gameId, organizationId, role) {
  if (!role) {
    const taken = (
      await db
        .select({ role: gameOrganizations.role })
        .from(gameOrganizations)
        .where(
          and(
            eq(gameOrganizations.gameId, gameId),
            eq(gameOrganizations.organizationId, organizationId)
          )
        )
    ).map((link) => link.role);
    role = ['developer', 'publisher', ...GAME_ORGANIZATION_ROLES].find(
      (candidate) => !taken.includes(candidate)
    );
    if (!role) return;
  }
  await db
    .insert(gameOrganizations)
    .values({ gameId, organizationId, role })
    .onConflictDoNothing();
}

const gameOrganizationLink = (gameId, organizationId, role) =>
  and(
    eq(gameOrganizations.gameId, gameId),
    eq(gameOrganizations.organizationId, organizationId),
    eq(gameOrganizations.role, role)
  );

/**
 * Changes how an organisation took part in a game (#40), from one of
 * GAME_ORGANIZATION_ROLES to another. If it already has the new role too,
 * the two become one.
 */
export async function setGameOrganizationRole(gameId, organizationId, from, to) {
  if (from === to) return;
  await db.batch([
    db
      .insert(gameOrganizations)
      .values({ gameId, organizationId, role: to })
      .onConflictDoNothing(),
    db
      .delete(gameOrganizations)
      .where(gameOrganizationLink(gameId, organizationId, from)),
  ]);
}

/** Removes one of an organisation's roles from a game's credits. */
export async function removeGameOrganization(gameId, organizationId, role) {
  await db
    .delete(gameOrganizations)
    .where(gameOrganizationLink(gameId, organizationId, role));
}

/**
 * Adds a step to a game's timeline (#332): `kind` one of
 * GAME_MILESTONE_KINDS, `date` and `precision` as utils/gameTimeline's
 * milestoneDate makes them. It's a change to the game, in its history.
 */
export async function addGameMilestone(gameId, { kind, date, precision, note, authorId = null }) {
  await db.batch([
    db.insert(gameMilestones).values({ gameId, kind, date, datePrecision: precision, note: note || null }),
    touch(gameId, authorId),
    logChange('update', 'game', gameId, authorId),
  ]);
}

/** Removes a step from a game's timeline, in the game's history too. */
export async function removeGameMilestone(gameId, milestoneId, { authorId = null } = {}) {
  await db.batch([
    db
      .delete(gameMilestones)
      .where(and(eq(gameMilestones.gameId, gameId), eq(gameMilestones.id, milestoneId))),
    touch(gameId, authorId),
    logChange('update', 'game', gameId, authorId),
  ]);
}

// Marks a game as just changed by `authorId`.
const touch = (gameId, authorId) =>
  db.update(games).set({ lastModifiedById: authorId, updatedAt: new Date() }).where(eq(games.id, gameId));

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
 * Games matching `q` (see data/search), best first, for pickers: computed
 * games with only `id` and `name`, at most 10. Empty for an empty query.
 */
export async function searchGames(q, { excludeIds = [] } = {}) {
  const found = await searchIndex(q, { kinds: ['game'], excludeIds });
  if (!found || found.hits.length === 0) return [];
  const ids = found.hits.map((hit) => hit.id);
  const rows = await db
    .select({ id: games.id, name: games.name, slug: games.slug })
    .from(games)
    .where(and(notDeleted, inArray(games.id, ids)));
  return Promise.all(inOrder(ids, rows).map(computeGame));
}

/** Games as cards, computed, in the order of `ids` (search results). */
export async function listGameCards(ids) {
  if (ids.length === 0) return [];
  const rows = await db.query.games.findMany({
    where: and(notDeleted, inArray(games.id, ids)),
    with: CARD_WITH,
  });
  return Promise.all(
    inOrder(ids, rows).map(gameWithRelations).map(computeGame)
  );
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

/**
 * Games worth featuring (#199): complete ones, with an image, a tag and a
 * credited organisation, most recently updated first, computed. The
 * newest games are often the emptiest.
 */
export async function listFeaturedGames({ limit }) {
  const has = (table, column) =>
    exists(
      db
        .select({ one: sql`1` })
        .from(table)
        .where(eq(column, games.id))
    );
  const rows = await db.query.games.findMany({
    where: and(
      notDeleted,
      has(gameImages, gameImages.gameId),
      has(gameTags, gameTags.gameId),
      has(gameOrganizations, gameOrganizations.gameId)
    ),
    with: CARD_WITH,
    orderBy: [desc(games.updatedAt), asc(games.id)],
    limit,
  });
  return Promise.all(rows.map(gameWithRelations).map(computeGame));
}
