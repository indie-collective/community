
import isAuthenticated from '../utils/isAuthenticated.server'

import { isUsernameTaken } from '../data/people.server';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');

  if (!query) return { available: false };

  const currentUser = await isAuthenticated(request);

  if (currentUser.username === query) return { available: true };

  return { available: !(await isUsernameTaken(query)) };
}
