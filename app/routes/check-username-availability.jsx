
import { authenticator } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server'

import { db } from '../utils/db.server';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');

  if (!query) return { available: false };

  const currentUser = await isAuthenticated(request);

  if (currentUser.username === query) return { available: true };

  const user = await db.person.findUnique({
    where: {
      username: query,
    },
  });

  return { available: !user };
}
