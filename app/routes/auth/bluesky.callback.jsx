import { redirect } from 'react-router';

import {
  createBlueskyClient,
  identityOf,
} from '../../utils/bluesky/oauth.server';
import { personForBlueskyIdentity } from '../../utils/bluesky/signIn.server';
import getOrigin from '../../utils/origin.server';
import { safeRedirectPath } from '../../utils/safeRedirect';
import { commitSession, getSession } from '../../utils/session.server';
import toSessionUser from '../../utils/sessionUser.server';

// Back from Bluesky (#157): find or create the person by DID, sign them in,
// and return to the page that sent them (kept in the OAuth state).
export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  let prev = '/';
  try {
    const { session, state } = await createBlueskyClient(
      getOrigin(request)
    ).callback(params);
    prev = safeRedirectPath(state);
    const person = await personForBlueskyIdentity(await identityOf(session));

    const cookieSession = await getSession(request.headers.get('cookie'));
    cookieSession.set('user', toSessionUser(person));
    return redirect(prev, {
      headers: { 'Set-Cookie': await commitSession(cookieSession) },
    });
  } catch (error) {
    console.error('Bluesky sign-in failed:', error);
    const search = new URLSearchParams({
      error: error?.message?.startsWith('An account already uses')
        ? error.message
        : 'Signing in with Bluesky failed. Please try again.',
    });
    if (prev !== '/') search.set('prev', prev);
    return redirect(`/signin?${search}`);
  }
}
