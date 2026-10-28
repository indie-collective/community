// What a link says about a game, organisation or event being added (#338),
// for its form. Members only: it fetches pages for them.
import { prefillFrom } from '../../data/sources.server';
import isAuthenticated from '../../utils/isAuthenticated.server';

const KINDS = ['game', 'organization', 'event'];

export async function loader({ request }) {
  const currentUser = await isAuthenticated(request);
  if (!currentUser) throw new Response('Unauthorized', { status: 401 });
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind');
  if (!KINDS.includes(kind) || !params.get('url')) throw new Response('Bad Request', { status: 400 });
  try {
    return await prefillFrom(kind, params.get('url'));
  } catch (error) {
    return { error: `Couldn't read that page: ${error.message}` };
  }
}
