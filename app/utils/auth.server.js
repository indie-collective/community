import { redirect } from 'react-router';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import {
  avatarThumbnail,
  createPerson,
  findPersonByEmail,
} from '../data/people.server';
import { Authorizer } from './authorizer.server';
import { devSignIn } from './devSignIn.server';
import { notifyNewMember } from './discordNotification.server';

export let authenticator = new Authenticator();

// People sign in with Bluesky (utils/bluesky, routes/auth/bluesky.callback).
// This authenticator only holds the development sign-in by email.
if (devSignIn()) {
  authenticator.use(
    new FormStrategy(async ({ form }) => {
      let email = form.get('email');
      try {
        let user = await findPersonByEmail(email);

        if (!user) {
          const username = email.split('@')[0];
          user = await createPerson({
            email,
            username,
            first_name: username,
          });
          await notifyNewMember(user);
        }

        return {
          ...user,
          avatar: await avatarThumbnail(user.avatar_id),
        };
      } catch (err) {
        console.log('err', err);
        throw err;
      }
    }),
    'user-pass'
  );
}

/* Global authorization rules */
async function hasEmail({ user, request }) {
  const url = new URL(request.url);

  if (!user.email && url.pathname !== '/welcome') {
    throw redirect('/welcome');
  }

  return true;
}

export let authorizer = new Authorizer(authenticator, [hasEmail]);

/* Per route authorization rules: rights are stored in the database (#156),
 * read by isAuthenticated() on every request. */
export async function canWrite({ user }) {
  return Boolean(user.canEdit);
}

export async function canDelete({ user }) {
  return Boolean(user.isAdmin);
}
