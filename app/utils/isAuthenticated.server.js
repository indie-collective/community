import { redirect } from 'react-router';

import { getRole } from '../data/people.server';
import { sessionStorage } from './session.server';
import toSessionUser from './sessionUser.server';

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
  const { pathname, search } = new URL(request.url);
  // Keep the query string too; '/' stays readable in the URL.
  const prev = encodeURIComponent(pathname + search).replace(/%2F/gi, '/');

  throw redirect('/signin?prev=' + prev, {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}

export default async function isAuthenticated(request, required) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'));
  if (!session.has('user')) {
    if (required) await redirectToSignin(request, session);
    return null;
  }

  // Cookies written before #180 hold the whole person row: read every
  // session back as the minimal session user.
  const currentUser = toSessionUser(session.get('user'));

  if (!currentUser?.id) {
    if (required) await redirectToSignin(request, session);
    return currentUser;
  }

  // The person must still exist, and their rights come from the database
  // on every request, so a change on /admin/users applies at once (#156).
  const role = await getRole(currentUser.id);
  if (!role) await redirectToSignin(request, session);

  // this might get useless if authorized is used everywhere
  await hasEmail({ user: currentUser, request });

  return {
    ...currentUser,
    isAdmin: role === 'admin',
    canEdit: role === 'admin' || role === 'member',
  };
}
