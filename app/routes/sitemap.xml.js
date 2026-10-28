import { listCountryCodes } from '../data/countries.server';
import { listSitemapRecords } from '../data/site.server';
import { listPublicUsernames } from '../data/profiles.server';
import { isFeatureOn } from '../data/featureFlags.server';
import getOrigin from '../utils/origin.server';
import { buildSitemap } from '../utils/sitemap';
import countryNames from '../assets/countries.json';

// For search engines (#258). Cached for an hour: it only changes as fast as
// people add things.
export const loader = async ({ request }) => {
  const [countries, { games, orgs, events }, people, opportunities] = await Promise.all([
    listCountryCodes(),
    listSitemapRecords(),
    listPublicUsernames(),
    isFeatureOn('opportunities', null),
  ]);
  const xml = buildSitemap(getOrigin(request), {
    // Codes the country page doesn't know would only be 404s.
    countries: countries.filter((code) => countryNames[code]),
    games,
    orgs,
    events,
    people,
    hidden: opportunities ? [] : ['/opportunities'],
  });
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
