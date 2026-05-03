import { redirect } from 'react-router';
import { REST, Routes } from 'discord.js';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { SocialsProvider } from 'remix-auth-socials';
import { DiscordStrategy } from 'remix-auth-discord';

import { db } from './db.server';
import getImageLinks from './imageLinks.server';
import { sessionStorage } from './session.server';
import { Authorizer } from './authorizer.server';

export let authenticator = new Authenticator();

const port = process.env.PORT ?? 3000;

const CALLBACK_BASE_URL =
  (process.env.BASE_URL ?? `http://localhost:${port}`) + '/auth';

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error(
    'DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN environment variables are needed to auth the users.'
  );
  process.exit(-1);
}

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_BOT_TOKEN // A bot token is needed to look for a user and its roles within the guild
);

if (process.env.NODE_ENV === 'development') {
  authenticator.use(
    new FormStrategy(async ({ form }) => {
      let email = form.get('email');
      try {
        let user = await db.person.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          const username = email.split('@')[0];
          user = await db.person.create({
            data: {
              email,
              username,
              first_name: username,
              isAdmin: true,
            },
          });
        }

        let avatar;

        if (user.avatar_id)
          avatar = await db.image.findFirst({
            where: {
              id: user.avatar_id,
            },
          });

        return {
          ...user,
          avatar: avatar ? getImageLinks(avatar).thumbnail_url : null,
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
      scopes: ['email identify guilds.join guilds.members.read guilds'],
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

        const guildMember = await rest.get(
          Routes.guildMember(
            '84687138729259008', // IC server
            profile.id
          )
        );

        let isAdmin = false;

        if (guildMember) {
          isAdmin = guildMember.roles.some((r) =>
            [
              '179728307691061248', // Admin
              '448936953585598465', // Staff
              '608759609246875687', // CA
              '695006197425635460', // Bureau
            ].includes(r)
          );

          // 694986277556060271 -> adhérent -> special status?
        }

        let user = await db.person.findUnique({
          where: {
            discord_id: profile.id,
          },
        });

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

          user = await db.person.create({
            data: {
              email: profile.email,
              discord_id: profile.id,
              first_name: profile.global_name || profile.username,
              last_name: '',
              username: profile.username,
              avatar_oauth: discordAvatar, // needed to be seen by other users
              isAdmin,
            },
          });
        }

        let avatar = discordAvatar;

        if (user.avatar_id) {
          avatar = await db.image.findFirst({
            where: {
              id: user.avatar_id,
            },
          });

          avatar = getImageLinks(avatar).thumbnail_url;
        }
        // updating oauth avatar in case it is now different
        else if (user.avatar_oauth !== discordAvatar) {
          await db.person.update({
            where: { id: user.id },
            data: { avatar_oauth: discordAvatar },
          });
        }

        // is now admin
        if (!user.isAdmin && isAdmin) {
          await db.person.update({
            where: { id: user.id },
            data: { isAdmin },
          });
        }

        return {
          ...user,
          isGuildMember: !!guildMember,
          avatar,
        };
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

/* Per route authorization rules */
export async function canWrite({ user }) {
  if (!user.discord_id) {
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  }
  const guildMember = await rest.get(
    Routes.guildMember(
      '84687138729259008', // IC server
      user.discord_id
    )
  );

  // TODO: maybe need to check another property, have to ban someone to try

  // TODO: check if user.guildMember has changed and invalidate if different
  // throw redirect? + set cookies

  return !!guildMember;
}

export async function canDelete({ user }) {
  return (
    await db.person.findUnique({
      where: {
        id: user.id,
      },
    })
  ).isAdmin;
}
