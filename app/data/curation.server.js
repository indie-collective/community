// Gaps in the data (#151, part 2), for the admin page that lists what
// needs filling in.
import { db } from '../utils/db.server';

const newestFirst = {
  select: { id: true, name: true },
  orderBy: { created_at: 'desc' },
};

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
    db.game.findMany({ ...newestFirst, where: { game_image: { none: {} } } }),
    db.game.findMany({ ...newestFirst, where: { game_entity: { none: {} } } }),
    db.game.findMany({ ...newestFirst, where: { game_tag: { none: {} } } }),
    db.entity.findMany({
      ...newestFirst,
      where: { game_entity: { none: {} } },
    }),
    db.entity.findMany({ ...newestFirst, where: { location: { is: null } } }),
  ]);
  return {
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  };
}
