import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

const isProduction = process && process.env.NODE_ENV === 'production';

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          audience: isProduction
            ? 'https://community.indieco.xyz/graphql'
            : 'http://localhost:4000/graphql',
          scope: 'openid profile email',
        },
      });
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  },
});
