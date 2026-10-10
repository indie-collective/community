// The year in review (#151, part 2): what /rewind counts.
import { db } from '../utils/db.server';

/**
 * A year's numbers: events held, games, studios and associations added,
 * the five most used tags on its new games (`{ name, count }`), and the
 * five places with the most organisations and events (`{ city, country,
 * total }`), among ten that gained one that year.
 */
export async function getYearInReview(year) {
  const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59Z`);

  const [
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags,
    topLocations,
  ] = await Promise.all([
    db.event.count({
      where: {
        starts_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.game.count({
      where: {
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
        deleted: false,
      },
    }),
    db.entity.count({
      where: {
        type: 'studio',
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.entity.count({
      where: {
        type: 'association',
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.game_tag.groupBy({
      by: ['tag_id'],
      where: {
        game: {
          created_at: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      },
      _count: {
        tag_id: true,
      },
      orderBy: {
        _count: {
          tag_id: 'desc',
        },
      },
      take: 5,
    }),
    db.location.findMany({
      where: {
        OR: [
          {
            entity: {
              some: {
                created_at: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
            },
          },
          {
            event: {
              some: {
                created_at: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
            },
          },
        ],
      },
      select: {
        city: true,
        country_code: true,
        _count: {
          select: {
            entity: true,
            event: true,
          },
        },
      },
      take: 10,
    }),
  ]);

  // Fetch tag names for topTags
  const topTagsWithNames = await Promise.all(
    topTags.map(async (t) => {
      const tag = await db.tag.findUnique({
        where: { id: t.tag_id },
        select: { name: true },
      });
      return { name: tag?.name || 'Unknown', count: t._count.tag_id };
    })
  );

  return {
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags: topTagsWithNames,
    topLocations: topLocations
      .map((l) => ({
        city: l.city || 'Unknown',
        country: l.country_code,
        total: l._count.entity + l._count.event,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
  };
}
