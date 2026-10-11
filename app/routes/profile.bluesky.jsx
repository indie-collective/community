import { redirect } from 'react-router';

import { createBlueskyClient, LINK_STATE } from '../utils/bluesky/oauth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import getOrigin from '../utils/origin.server';

// Links the signed-in person's Bluesky account (#158). There's no unlinking:
// Bluesky is the only way to sign in (#159).
export async function action({ request }) {
  await isAuthenticated(request, true);
  const form = await request.formData();

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
