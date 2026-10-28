import {
  countOrganizations,
  countPublishers,
  listOrganizations,
  listPublishers,
} from '../data/organizations.server';
import { isFeatureOn } from '../data/featureFlags.server';
import isAuthenticated from './isAuthenticated.server';

export const PAGE_SIZE = 50;

/**
 * One page of the studios or associations list, with the filters from the
 * URL (`country`, `city`, `has_games`, `has_events`) and the country facet.
 *
 * @param {Request} request
 * @param {'studio' | 'association'} type
 */
export async function loadOrgList(request, type) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1);
  const country = searchParams.get('country');
  // From a country page's cities (#258).
  const city = searchParams.get('city')?.trim() || null;
  const has_games = searchParams.get('has_games');
  const has_events = searchParams.get('has_events');

  const [{ orgs, hasMore, countries }, total] = await Promise.all([
    listOrganizations({
      type,
      page,
      pageSize: PAGE_SIZE,
      country,
      city,
      hasGames: has_games === 'on',
      hasEvents: has_events === 'on',
    }),
    countOrganizations({ type }),
  ]);

  return {
    total,
    orgs,
    hasMore,
    page,
    facets: {
      countries,
    },
    selected: {
      country,
      city,
      has_games,
      has_events,
    },
  };
}

/**
 * One page of the publishers list (#331), with the filters from the URL
 * (`country`, `city`, `tag`) and the country and tag facets.
 *
 * @param {Request} request
 */
export async function loadPublisherList(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1);
  const country = searchParams.get('country');
  const city = searchParams.get('city')?.trim() || null;
  const tag = searchParams.get('tag')?.trim() || null;
  // #345: behind the opportunities feature flag (/admin/flags).
  const pitches = searchParams.get('pitches') === 'on' && (await isFeatureOn('opportunities', await isAuthenticated(request)));

  const [{ orgs, hasMore, countries, tags }, total] = await Promise.all([
    listPublishers({ page, pageSize: PAGE_SIZE, country, city, tag, pitches }),
    countPublishers(),
  ]);

  return {
    total,
    orgs,
    hasMore,
    page,
    facets: { countries, tags },
    selected: { country, city, tag, pitches: pitches ? 'on' : null },
  };
}
