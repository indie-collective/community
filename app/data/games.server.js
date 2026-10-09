// Games: every read and write the routes make (#151, part 2). The only
// place that knows how games are stored; the D1 port reimplements these
// functions with the same results, and the routes don't change.
import { db } from '../utils/db.server';
import computeGame from '../models/game';
import { refreshIfStale } from '../utils/igdbData.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import { resolveTagNames } from '../utils/tags.server';

// The games list's orders, by the keys the page offers (routes/games).
const ORDERS = {
  updated: { updated_at: 'desc' },
  newest: { created_at: 'desc' },
  name: { name: 'asc' },
};

const CARD_INCLUDE = {
  igdb: true,
  game_image: { include: { image: true } },
  game_tag: { include: { tag: true } },
  game_entity: { include: { entity: true } },
};

/**
 * One page of the games list and the tags of every matching game.
 * `country` keeps games made by one of the country's studios (#258); `q`
 * matches name or about; every tag in `tags` must be on the game.
 *
 * @returns {Promise<{ games: object[], tags: object[] }>} computed games
 *   (see models/game), and tags with their `game_tag` links among the matches
 */
export async function listGames({
  page = 1,
  pageSize = 10,
  tags = [],
  q = null,
  sort = 'updated',
  country = null,
}) {
  const where = {
    deleted: false,
    ...(country && {
      game_entity: {
        some: { entity: { location: { country_code: country } } },
      },
    }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { about: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(tags.length > 0 && {
      AND: tags.map((tag) => ({ game_tag: { some: { tag: { name: tag } } } })),
    }),
  };

  const [tagRows, games] = await Promise.all([
    db.tag.findMany({
      where: { game_tag: { some: { game: where } } },
      include: { game_tag: { where: { game: where } } },
      orderBy: [{ game_tag: { _count: 'desc' } }, { name: 'asc' }],
    }),
    db.game.findMany({
      where,
      // id last, so pages don't overlap when sorted values tie.
      orderBy: [ORDERS[sort] ?? ORDERS.updated, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
  ]);

  return { tags: tagRows, games: await Promise.all(games.map(computeGame)) };
}

/**
 * A game for its page, with its images, tags, studios (with logos), events
 * and stored IGDB data, or null. Stale IGDB data is refreshed after the
 * response (#254), so the page never waits for IGDB.
 */
export async function getGame(id, { context } = {}) {
  const game = await db.game.findUnique({
    where: { id },
    include: {
      igdb: true,
      game_image: { include: { image: true } },
      game_tag: { include: { tag: true } },
      game_entity: { include: { entity: { include: { logo: true } } } },
      game_event: { include: { event: true } },
    },
  });
  if (!game) return null;
  refreshIfStale(db, game, context);
  return computeGame(game);
}

/** A game for its edit form: with its images and tags, or null. */
export async function getGameForEdit(id) {
  const game = await db.game.findUnique({
    where: { id },
    include: {
      game_image: { include: { image: true } },
      game_tag: { include: { tag: true } },
    },
  });
  return game ? computeGame(game) : null;
}

/** The tag names typed in a form, with aliases resolved to their tags (#207). */
export function resolveGameTags(value) {
  return resolveTagNames(db, value);
}

// The tags named, created when they don't exist yet.
function upsertTags(names) {
  return db.$transaction(
    names.map((name) =>
      db.tag.upsert({ where: { name }, create: { name }, update: {} })
    )
  );
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
  const tags = await upsertTags(tagNames);
  return db.game.create({
    data: {
      name,
      about,
      site,
      igdb_slug: igdbSlug,
      lastModifiedById: authorId,
      game_tag: {
        createMany: { data: tags.map((tag) => ({ tag_id: tag.id })) },
      },
    },
    select: { id: true },
  });
}

/**
 * Updates a game's fields, and sets its tags to exactly `tagNames`.
 * @returns {Promise<{ id: string }>}
 */
export async function updateGame(
  id,
  { name, about, site, igdbSlug, tagNames, authorId }
) {
  const tags = await upsertTags(tagNames);
  return db.game.update({
    where: { id },
    data: {
      name,
      about,
      site,
      igdb_slug: igdbSlug,
      lastModifiedById: authorId,
      game_tag: {
        createMany: {
          data: tags.map((tag) => ({ tag_id: tag.id })),
          skipDuplicates: true,
        },
        deleteMany: { tag_id: { notIn: tags.map((t) => t.id) } },
      },
    },
    select: { id: true },
  });
}

/** Deletes a game (soft: it's only hidden, see utils/db.server). */
export async function deleteGame(id) {
  await db.game.delete({ where: { id } });
}

/** Credits an organisation on a game; already credited is fine. */
export async function addGameOrganization(gameId, organizationId) {
  await db.game_entity.upsert({
    where: {
      game_id_entity_id: { game_id: gameId, entity_id: organizationId },
    },
    create: { game_id: gameId, entity_id: organizationId },
    update: {},
  });
}

/** Removes an organisation from a game's credits. */
export async function removeGameOrganization(gameId, organizationId) {
  await db.game_entity.delete({
    where: {
      game_id_entity_id: { game_id: gameId, entity_id: organizationId },
    },
  });
}

/** Adds uploaded images (their IDs) to a game. */
export async function addGameImages(gameId, imageIds) {
  await db.game_image.createMany({
    data: imageIds.map((imageId) => ({ game_id: gameId, image_id: imageId })),
  });
}

/** Removes images (their IDs) from a game. */
export async function removeGameImages(gameId, imageIds) {
  await db.game_image.deleteMany({
    where: {
      OR: imageIds.map((imageId) => ({ game_id: gameId, image_id: imageId })),
    },
  });
}

/**
 * Games whose name matches `q`, for pickers: computed games with only `id`
 * and `name`, at most 10. Empty for an empty query.
 */
export async function searchGames(q, { excludeIds = [] } = {}) {
  const search = getFullTextSearchQuery(q);
  if (!search) return [];
  const games = await db.game.findMany({
    where: { name: { search }, id: { notIn: excludeIds } },
    select: { id: true, name: true },
    take: 10,
  });
  return Promise.all(games.map(computeGame));
}
