// Tags (#151): what the tags admin page reads and writes, and the tag
// names a game form resolves. A game's tags are set through data/games.
import { asc, count, eq, inArray, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { gameTags, games, tagAliases, tags } from '../db/schema.js';
import { parseTagList } from '../utils/tags';

/**
 * The canonical tag names for a comma-separated tags field (#207): parsed
 * and normalised, then mapped through tag aliases ("coop" → "co-op"),
 * unique.
 */
export async function resolveTagNames(value) {
  const names = parseTagList(value);
  if (names.length === 0) return [];

  const aliases = await db
    .select({ alias: tagAliases.alias, name: tags.name })
    .from(tagAliases)
    .innerJoin(tags, eq(tags.id, tagAliases.tagId))
    .where(inArray(tagAliases.alias, names));
  const canonical = new Map(aliases.map(({ alias, name }) => [alias, name]));

  return [...new Set(names.map((name) => canonical.get(name) ?? name))];
}

/**
 * Every tag, by name, with how many games have it (deleted games left
 * out): `_count.game_tag`.
 */
export async function listTags() {
  const rows = await db
    .select({
      id: tags.id,
      name: tags.name,
      created_at: tags.createdAt,
      updated_at: tags.updatedAt,
      games: count(games.id),
    })
    .from(tags)
    .leftJoin(gameTags, eq(gameTags.tagId, tags.id))
    .leftJoin(
      games,
      sql`${games.id} = ${gameTags.gameId} and ${games.deletedAt} is null`
    )
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
  return rows.map(({ games: gameCount, ...tag }) => ({
    ...tag,
    _count: { game_tag: gameCount },
  }));
}

/** Adds a tag, trimmed and lowercased; an existing one is fine. */
export async function addTag(name) {
  await db
    .insert(tags)
    .values({ name: name.trim().toLowerCase() })
    .onConflictDoNothing();
}

/** Deletes a tag, and removes it from games. */
export async function deleteTag(id) {
  await db.delete(tags).where(eq(tags.id, id));
}

/** Moves every game tagged `fromId` to `toId`, then deletes `fromId`. */
export async function mergeTags(fromId, toId) {
  await db.batch([
    db
      .insert(gameTags)
      .select(
        db
          .select({
            gameId: gameTags.gameId,
            tagId: sql`${toId}`.as('tag_id'),
            createdAt: gameTags.createdAt,
          })
          .from(gameTags)
          .where(eq(gameTags.tagId, fromId))
      )
      .onConflictDoNothing(),
    db.delete(tags).where(eq(tags.id, fromId)),
  ]);
}
