// Atom feeds of what's new (#342): games, events, organisations, or all of
// them, optionally in a country (?country=FR).
import countryNames from '../../assets/countries.json';
import { listNewest } from '../../data/feeds.server';
import { atomFeed, feedResponse } from '../../utils/feed';
import { image } from '../../data/shapes.server';
import getImageLinks from '../../utils/imageLinks.server';
import getOrigin from '../../utils/origin.server';
import { eventPath, gamePath, orgPath } from '../../utils/slug';

const FEEDS = {
  '/feed.xml': { kinds: ['game', 'event', 'organization'], title: 'New on Indie Collective', site: '/' },
  '/games/feed.xml': { kinds: ['game'], title: 'New games', site: '/games' },
  '/events/feed.xml': { kinds: ['event'], title: 'New events', site: '/events' },
  '/orgs/feed.xml': { kinds: ['organization'], title: 'New studios and associations', site: '/orgs' },
};

const PATHS = { game: gamePath, event: eventPath, organization: orgPath };
const IMAGE_KEY = { event: 'coverKey', organization: 'logoKey' };

export async function loader({ request }) {
  const url = new URL(request.url);
  const feed = FEEDS[url.pathname];
  if (!feed) throw new Response('Not Found', { status: 404 });
  const countryCode = url.searchParams.get('country')?.toUpperCase();
  const country = countryCode && countryNames[countryCode];
  if (countryCode && !country) throw new Response('Not Found', { status: 404 });

  const origin = getOrigin(request);
  const rows = (
    await Promise.all(feed.kinds.map((kind) => listNewest(kind, { countryCode })))
  )
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);

  const entries = rows.map((row) => {
    const key = row[IMAGE_KEY[row.kind]];
    const picture = key && getImageLinks(image(key)).url;
    return {
      title: row.name,
      url: `${origin}${PATHS[row.kind](row)}`,
      summary: row.about,
      published: row.createdAt,
      updated: row.updatedAt,
      image: picture ? new URL(picture, origin).href : null,
    };
  });

  return feedResponse(
    atomFeed({
      title: country ? `${feed.title} in ${country}` : feed.title,
      self: `${origin}${url.pathname}${url.search}`,
      site: `${origin}${feed.site}${countryCode ? `?country=${countryCode}` : ''}`,
      entries,
    })
  );
}
