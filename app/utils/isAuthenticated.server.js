import { redirect } from 'react-router';

import { db } from './db.server';
import { sessionStorage } from './session.server';

async function hasEmail({ user, request }) {
  const url = new URL(request.url);

  if (!user.email && url.pathname !== '/welcome') {
    throw redirect('/welcome');
  }

  return true;
}

// Throws a redirect to the sign-in page and clears the session cookie.
// Callers must `await` this: the throw happens after `destroySession`
// resolves, so calling it bare leaves an unhandled rejection behind and
// lets execution fall through as if the user were authenticated.
async function redirectToSignin(request, session) {
  const prevURL = new URL(request.url);

  throw redirect('/signin?prev=' + prevURL.pathname, {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}

export default async function isAuthenticated(request, required) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'));
  if (!session.has('user')) {
    if (required) await redirectToSignin(request, session);
    return null;
  }

  const currentUser = session.get('user');

  if (!currentUser?.id) {
    if (required) await redirectToSignin(request, session);
    return currentUser;
  }

  // check if user still exists in the database
  const user = await db.person.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
    },
  });

  if (!user) await redirectToSignin(request, session);

  // this might get useless if authorized is used everywhere
  await hasEmail({ user: currentUser, request });

  return currentUser;
}
