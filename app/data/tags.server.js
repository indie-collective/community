// Tags (#151, part 2): what the tags admin page reads and writes. A game's
// tags are set through data/games.
import { db } from '../utils/db.server';

/** Every tag, by name, with how many games have it: `_count.game_tag`. */
export function listTags() {
  return db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { game_tag: true } } },
  });
}

/** Adds a tag, trimmed and lowercased; an existing one is fine. */
export async function addTag(name) {
  const normalised = name.trim().toLowerCase();
  await db.tag.upsert({
    where: { name: normalised },
    update: {},
    create: { name: normalised },
  });
}

/** Deletes a tag, and removes it from games. */
export async function deleteTag(id) {
  await db.tag.delete({ where: { id } });
}

/** Moves every game tagged `fromId` to `toId`, then deletes `fromId`. */
export async function mergeTags(fromId, toId) {
  await db.$transaction([
    db.game_tag.updateMany({
      where: { tag_id: fromId },
      data: { tag_id: toId },
    }),
    db.tag.delete({ where: { id: fromId } }),
  ]);
}
