import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import {
  SocialsProvider,
  DiscordStrategy,
  GitHubStrategy,
} from 'remix-auth-socials';
import { SteamStrategy } from 'remix-auth-steam';

import { db } from './db.server';
import getImageLinks from './imageLinks.server';
import { sessionStorage } from './session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage);

const port = process.env.PORT ?? 3000;

const CALLBACK_BASE_URL = (process.env.BASE_URL ?? `http://localhost:${port}`) + '/auth';

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get('email');
    let password = form.get('password');

    try {
      const [user] =
        await db.$queryRaw`select * from indieco.person p where email = ${email} and password_hash = public.crypt(${password}, p.password_hash);`;

      if (!user)
        throw new Error('User does not exist or you used wrong credentials');

      delete user.password_hash;

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
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass'
);

authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${CALLBACK_BASE_URL}/${SocialsProvider.DISCORD}/callback`,
    },
    async ({ profile }) => {
      try {
        const user = await db.person.upsert({
          where: {
            email: profile.emails[0].value,
          },
          create: {
            email: profile.emails[0].value,
            discord_id: profile.id,
            first_name: profile.name?.givenName || profile.displayName,
            last_name: profile.name?.familyName,
            username: profile.displayName,
          },
          update: {},
        });

        return {
          ...user,
          avatar:
            'https://cdn.discordapp.com/avatars/' +
            profile.id +
            '/' +
            profile.photos[0].value,
        };
      } catch (err) {
        console.log(err);
        throw new Error('Error connecting to Discord');
      }
    }
  )
);

authenticator.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${CALLBACK_BASE_URL}/${SocialsProvider.GITHUB}/callback`,
    },
    async ({ profile }) => {
      const user = await db.person.upsert({
        where: {
          email: profile.emails[0].value,
        },
        create: {
          email: profile.emails[0].value,
          discord_id: profile.id,
          first_name: profile.name?.givenName || profile.displayName,
          last_name: profile.name?.familyName,
          username: profile.displayName, // github username
          about: profile._json.bio,
        },
        update: {},
      });

      return {
        ...user,
        avatar: profile.photos[0].value,
      };
    }
  )
);

authenticator.use(
  new SteamStrategy(
    {
      returnURL: `${CALLBACK_BASE_URL}/steam/callback`,
      apiKey: process.env.STEAM_API_KEY,
    },
    async (profile) => {
      try {
        // TODO: either permit not having an email or cannot sign up without one (linking or force entering an email)
        const user = await db.person.upsert({
          where: {
            steam_id: profile.steamID,
          },
          create: {
            steam_id: profile.steamID,
            first_name: profile.realName || profile.nickname,
            username: profile.nickname,
          },
          update: {},
        });

        return {
          ...user,
          avatar: profile.avatar.large,
        };
      } catch (err) {
        console.log(err);
        throw new Error('Error connecting to Steam');
      }
    }
  ),
  'steam'
);

const { isAuthenticated } = authenticator;

authenticator.isAuthenticated = async function (request, options) {
  const currentUser = await isAuthenticated.call(
    authenticator,
    request,
    options
  );

  const url = new URL(request.url);

  if (currentUser && !currentUser.email && url.pathname !== '/welcome') {
    throw redirect('/welcome');
  }

  return currentUser;
};
