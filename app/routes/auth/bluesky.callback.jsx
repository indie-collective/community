import { redirect } from 'react-router';

import { DID_TAKEN, linkBluesky } from '../../data/people.server';
import {
  createBlueskyClient,
  identityOf,
  LINK_STATE,
} from '../../utils/bluesky/oauth.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { personForBlueskyIdentity } from '../../utils/bluesky/signIn.server';
import getOrigin from '../../utils/origin.server';
import { safeRedirectPath } from '../../utils/safeRedirect';
import { commitSession, getSession } from '../../utils/session.server';
import toSessionUser from '../../utils/sessionUser.server';

// Back from Bluesky, after linking an account to the signed-in person's
// profile (#158).
async function link(request, session) {
  const { did } = await identityOf(session);
  const currentUser = await isAuthenticated(request);
  if (!currentUser) return redirect('/signin');
  try {
    await linkBluesky(currentUser.id, did);
    return redirect('/profile');
  } catch (error) {
    if (error.message !== DID_TAKEN) throw error;
    return redirect(`/profile?error=${encodeURIComponent(DID_TAKEN)}`);
  }
}

// Back from Bluesky (#157): find or create the person by DID, sign them in,
// and return to the page that sent them (kept in the OAuth state); or,
// for a link, link it.
export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  let prev = '/';
  try {
    const { session, state } = await createBlueskyClient(
      getOrigin(request)
    ).callback(params);
    if (state === LINK_STATE) return await link(request, session);
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
