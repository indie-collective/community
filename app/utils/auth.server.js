import { redirect } from '@remix-run/node';
import { REST, Routes } from 'discord.js';
import { Authenticator, Authorizer } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import {
  SocialsProvider,
  DiscordStrategy,
  // GitHubStrategy,
} from 'remix-auth-socials';
// import { SteamStrategy } from 'remix-auth-steam';

import { db } from './db.server';
import getImageLinks from './imageLinks.server';
import { sessionStorage } from './session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage);

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
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${CALLBACK_BASE_URL}/${SocialsProvider.DISCORD}/callback`,
    },
    async ({ profile }) => {
      try {
        const discordAvatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.photos[0].value}`;

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
          //       in: profile.emails.map(({ value }) => value),
          //     },
          //   },
          // });

          // if (personsWithEmails.some((p) => !!p))
          //   throw new Error(
          //     'A user with the same email already exists, please connect your account first.'
          //   );

          user = await db.person.create({
            data: {
              email: profile.emails[0].value,
              discord_id: profile.id,
              first_name: profile.name?.givenName || profile.displayName,
              last_name: profile.name?.familyName,
              username: profile.displayName + profile.__json.discriminator,
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

// authenticator.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: `${CALLBACK_BASE_URL}/${SocialsProvider.GITHUB}/callback`,
//     },
//     async ({ profile }) => {
//       const user = await db.person.upsert({
//         where: {
//           email: profile.emails[0].value,
//         },
//         create: {
//           email: profile.emails[0].value,
//           discord_id: profile.id,
//           first_name: profile.name?.givenName || profile.displayName,
//           last_name: profile.name?.familyName,
//           username: profile.displayName, // github username
//           about: profile._json.bio,
//         },
//         update: {},
//       });

//       return {
//         ...user,
//         avatar: profile.photos[0].value,
//       };
//     }
//   )
// );

// authenticator.use(
//   new SteamStrategy(
//     {
//       returnURL: `${CALLBACK_BASE_URL}/steam/callback`,
//       apiKey: process.env.STEAM_API_KEY,
//     },
//     async (profile) => {
//       try {
//         // TODO: either permit not having an email or cannot sign up without one (linking or force entering an email)
//         const user = await db.person.upsert({
//           where: {
//             steam_id: profile.steamID,
//           },
//           create: {
//             steam_id: profile.steamID,
//             first_name: profile.realName || profile.nickname,
//             username: profile.nickname,
//           },
//           update: {},
//         });

//         return {
//           ...user,
//           avatar: profile.avatar.large,
//         };
//       } catch (err) {
//         console.log(err);
//         throw new Error('Error connecting to Steam');
//       }
//     }
//   ),
//   'steam'
// );

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

const { isAuthenticated } = authenticator;

authenticator.isAuthenticated = async function (request, options) {
  const currentUser = await isAuthenticated.call(
    authenticator,
    request,
    options
  );

  if (!currentUser) return currentUser;

  // check if user still exists in the database
  const user = await db.person.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    const prevURL = new URL(request.url);
    
    // todo: add redirect to previous page
    throw await authenticator.logout(request, {
      redirectTo: '/signin?prev=' + prevURL.pathname,
    });
  }

  // this might get useless if authorized is used everywhere
  await hasEmail({ user: currentUser, request });

  return currentUser;
};
