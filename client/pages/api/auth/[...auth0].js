import { handleAuth, handleCallback, handleLogin } from '@auth0/nextjs-auth0';
import fetch from 'isomorphic-unfetch';

const isProduction = process && process.env.NODE_ENV === 'production';

// registers the user as we don't have the auth0 rules to make it work locally
const afterCallback = async (req, res, session, state) => {
  if (!isProduction) {
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.ADMIN_SECRET,
        },
        body: JSON.stringify({
          query: `
            mutation registerPerson($id: String!, $email: String, $firstName: String!, $lastName: String) {
              registerPerson(input: {
                id: $id,
                email: $email,
                firstName: $firstName
                lastName: $lastName
              }) {
                person {
                  id
                }
              }
            }
          `,
          variables: {
            id: session.user.sub,
            email: session.user.email,
            firstName:
              session.user.given_name ||
              session.user.name ||
              session.user.nickname,
            lastName: session.user.family_name,
          },
        }),
      });
    } catch (err) {
      // we catch duplicated key error
    }
  }

  return session;
};

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          audience: isProduction
            ? 'https://community.indieco.xyz/graphql'
            : 'http://localhost:4000/graphql',
          scope: 'openid profile email',
          connection: req.query.connection,
        },
      });
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  },
  async callback(req, res) {
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error) {
      res.status(error.status || 500).end(error.message);
    }
  },
});
