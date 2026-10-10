import { redirect } from 'react-router';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { SocialsProvider } from 'remix-auth-socials';
import { DiscordStrategy } from 'remix-auth-discord';

import {
  avatarThumbnail,
  createPerson,
  findPersonByDiscordId,
  findPersonByEmail,
  setProviderAvatar,
} from '../data/people.server';
import { sessionStorage } from './session.server';
import { Authorizer } from './authorizer.server';
import { devSignIn } from './devSignIn.server';
import { notifyNewMember } from './discordNotification.server';
import { toOrigin } from './origin.server';

export let authenticator = new Authenticator();

const port = process.env.PORT ?? 3000;

const CALLBACK_BASE_URL =
  (toOrigin(process.env.BASE_URL) || `http://localhost:${port}`) + '/auth';

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
  console.error(
    'DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables are needed for Discord sign-in.'
  );
}

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

authenticator.use(
  new DiscordStrategy(
    {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      redirectURI: `${CALLBACK_BASE_URL}/${SocialsProvider.DISCORD}/callback`,
      // What main requested (remix-auth-socials' default). Membership is
      // checked with the bot token, so no guild scopes are needed.
      scopes: ['identify', 'email'],
    },
    async ({ tokens, request }) => {
      try {
        const response = await fetch('https://discord.com/api/users/@me', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        });
        const profile = await response.json();

        const discordAvatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`;

        let user = await findPersonByDiscordId(profile.id);

        // user is new
        if (!user) {
          // let's do it simple for now, email exists -> please sign in
          // const personsWithEmails = await db.person.findMany({
          //   where: {
          //     email: {
          //       in: profile.email,
          //     },
          //   },
          // });

          // if (personsWithEmails.some((p) => !!p))
          //   throw new Error(
          //     'A user with the same email already exists, please connect your account first.'
          //   );

          user = await createPerson({
            email: profile.email,
            discord_id: profile.id,
            first_name: profile.global_name || profile.username,
            last_name: '',
            username: profile.username,
            avatar_oauth: discordAvatar, // needed to be seen by other users
          });
          await notifyNewMember(user);
        }

        let avatar = discordAvatar;

        if (user.avatar_id) {
          avatar = await avatarThumbnail(user.avatar_id);
        }
        // updating oauth avatar in case it is now different
        else if (user.avatar_oauth !== discordAvatar) {
          await setProviderAvatar(user.id, discordAvatar);
        }

        return { ...user, avatar };
      } catch (err) {
        console.log(err);
        throw new Error('Error connecting to Discord');
      }
    }
  )
);

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
