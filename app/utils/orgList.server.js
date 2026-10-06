import { db } from './db.server';
import computeOrg from '../models/org';

export const PAGE_SIZE = 50;

/**
 * One page of the studios or associations list, with the filters from the
 * URL (`country`, `has_games`, `has_events`) and the country facet.
 *
 * @param {Request} request
 * @param {'studio' | 'association'} type
 */
export async function loadOrgList(request, type) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1);
  const country = searchParams.get('country');
  const has_games = searchParams.get('has_games');
  const has_events = searchParams.get('has_events');

  const where = {
    type,
    ...(country && { location: { country_code: country } }),
    ...(has_games === 'on' && { game_entity: { some: {} } }),
    ...(has_events === 'on' && { entity_event: { some: {} } }),
  };

  const [orgs, countries] = await Promise.all([
    db.entity.findMany({
      where,
      include: {
        location: true,
        logo: true,
      },
      // id last, so pages don't overlap when updated_at ties.
      orderBy: [{ updated_at: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      // One extra row tells whether there's a next page.
      take: PAGE_SIZE + 1,
    }),
    db.location.groupBy({
      by: ['country_code'],
      where: {
        entity: {
          some: { type },
        },
      },
      _count: true,
      orderBy: {
        _count: {
          country_code: 'desc',
        },
      },
    }),
  ]);

  return {
    orgs: await Promise.all(orgs.slice(0, PAGE_SIZE).map(computeOrg)),
    hasMore: orgs.length > PAGE_SIZE,
    page,
    facets: {
      countries,
    },
    selected: {
      country,
      has_games,
      has_events,
    },
  };
}
