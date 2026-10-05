// sitemap.xml and robots.txt, so search engines find every page (#258).

const PAGES = [
  '/',
  '/games',
  '/studios',
  '/associations',
  '/events',
  '/places',
  '/countries',
  '/about',
];

const escape = (text) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]
  );

const entry = (origin, path, updated) =>
  `  <url><loc>${escape(origin + path)}</loc>${
    updated
      ? `<lastmod>${new Date(updated).toISOString().slice(0, 10)}</lastmod>`
      : ''
  }</url>`;

/**
 * The sitemap: the main pages, every country with something placed in it,
 * and every game, organisation and event, with when each last changed.
 */
export function buildSitemap(
  origin,
  { countries = [], games = [], orgs = [], events = [] }
) {
  const urls = [
    ...PAGES.map((path) => entry(origin, path)),
    ...countries.map((code) => entry(origin, `/country/${code.toLowerCase()}`)),
    ...games.map(({ id, updated_at }) =>
      entry(origin, `/game/${id}`, updated_at)
    ),
    ...orgs.map(({ id, updated_at }) =>
      entry(origin, `/org/${id}`, updated_at)
    ),
    ...events.map(({ id, updated_at }) =>
      entry(origin, `/event/${id}`, updated_at)
    ),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** robots.txt: everything public, not the account and admin pages. */
export function buildRobots(origin) {
  return [
    'User-agent: *',
    'Disallow: /admin/',
    'Disallow: /auth/',
    'Disallow: /profile',
    'Disallow: /logout',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}
