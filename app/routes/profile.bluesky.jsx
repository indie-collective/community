import { redirect } from 'react-router';

import { unlinkBluesky } from '../data/people.server';
import { createBlueskyClient, LINK_STATE } from '../utils/bluesky/oauth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import getOrigin from '../utils/origin.server';

// Links or unlinks the signed-in person's Bluesky account (#158).
export async function action({ request }) {
  const currentUser = await isAuthenticated(request, true);
  const form = await request.formData();

  if (form.get('intent') === 'unlink') {
    const unlinked = await unlinkBluesky(currentUser.id);
    return redirect(
      unlinked
        ? '/profile'
        : `/profile?error=${encodeURIComponent(
            "Bluesky is your only way to sign in, so it can't be unlinked."
          )}`
    );
  }

  const handle = String(form.get('handle') ?? '')
    .trim()
    .replace(/^@/, '');
  try {
    const url = await createBlueskyClient(getOrigin(request)).authorize(
      handle || 'https://bsky.social',
      { state: LINK_STATE }
    );
    return redirect(url.href);
  } catch (error) {
    console.error('Linking Bluesky failed to start:', error);
    return redirect(
      `/profile?error=${encodeURIComponent(
        handle
          ? `We couldn't find the Bluesky account “${handle}”.`
          : 'Bluesky is unreachable right now. Please try again.'
      )}`
    );
  }
}
