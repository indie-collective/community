import { clientMetadata } from '../utils/bluesky/oauth.server';
import getOrigin from '../utils/origin.server';

// The Bluesky OAuth client's metadata (#157): its URL is the client ID.
export const loader = ({ request }) =>
  Response.json(clientMetadata(getOrigin(request)), {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
