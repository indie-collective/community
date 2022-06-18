import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import {
  SocialsProvider,
  DiscordStrategy,
  GitHubStrategy,
} from 'remix-auth-socials';

import { db } from './db.server';
import getImageLinks from './imageLinks.server';
import { sessionStorage } from './session.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage);

const CALLBACK_BASE_URL = `http://localhost:5000/auth`;

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
      console.log('discord profile', profile);

      try {
        const user = await db.person.upsert({
          where: {
            email: profile.emails[0].value,
          },
          create: {
            email: profile.emails[0].value,
            discord_id: profile.id,
            first_name: profile.displayName,
          },
          update: {},
        });
        console.log(user);

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
          first_name: profile.displayName,
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
