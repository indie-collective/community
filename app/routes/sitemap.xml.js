import { db } from '../utils/db.server';
import getOrigin from '../utils/origin.server';
import { buildSitemap } from '../utils/sitemap';
import countryNames from '../assets/countries.json';

// For search engines (#258). Cached for an hour: it only changes as fast as
// people add things.
export const loader = async ({ request }) => {
  const [countries, games, orgs, events] = await Promise.all([
    db.location.groupBy({ by: ['country_code'] }),
    db.game.findMany({
      where: { deleted: false },
      select: { id: true, updated_at: true },
    }),
    db.entity.findMany({ select: { id: true, updated_at: true } }),
    db.event.findMany({ select: { id: true, updated_at: true } }),
  ]);
  const xml = buildSitemap(getOrigin(request), {
    // Codes the country page doesn't know would only be 404s.
    countries: countries
      .map(({ country_code }) => country_code)
      .filter((code) => countryNames[code]),
    games,
    orgs,
    events,
  });
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
