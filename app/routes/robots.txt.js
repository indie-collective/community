import getOrigin from '../utils/origin.server';
import { buildRobots } from '../utils/sitemap';

// A route rather than a static file, so the sitemap line has the site's
// real origin (#258).
export const loader = ({ request }) =>
  new Response(buildRobots(getOrigin(request)), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
