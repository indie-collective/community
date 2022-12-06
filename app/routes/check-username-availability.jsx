import { json } from '@remix-run/node';
import { authenticator } from '../utils/auth.server';

import { db } from '../utils/db.server';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');

  if (!query) return json({ available: false });

  const currentUser = await authenticator.isAuthenticated(request);

  if (currentUser.username === query) return json({ available: true });

  const user = await db.person.findUnique({
    where: {
      username: query,
    },
  });

  return json({ available: !user });
}
