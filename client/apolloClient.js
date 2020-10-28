import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-unfetch';
import jwt from 'jsonwebtoken';
import { TokenRefreshLink } from 'apollo-link-token-refresh';

const isProduction = process && process.env.NODE_ENV === 'production';

const graphqlUrl = isProduction
  ? 'https://community.indieco.xyz/graphql'
  : 'http://localhost:4000/graphql';

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  const getToken = () => {
    let cookies;

    // JWT is in cookie for SSR
    if (ctx && ctx.req.headers.cookie) {
      cookies = ctx.req.headers.cookie;
    } else if (typeof window !== 'undefined') {
      cookies = document.cookie;
    }

    if (!/token=([^;]+)/.test(cookies)) {
      return null;
    }

    const [, token] = cookies.match(/token=([^;]+)/);

    return token;
  };

  const request = async (operation) => {
    const token = getToken();

    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }
  };

  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle;
        Promise.resolve(operation)
          .then((oper) => request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));

        return () => {
          if (handle) handle.unsubscribe();
        };
      })
  );

  const refreshLink = new TokenRefreshLink({
    accessTokenField: 'jwtToken',
    // No need to refresh if token exists and is still valid
    isTokenValidOrUndefined: () => {
      const token = getToken();

      if (!token) return true;

      const decodedToken = jwt.decode(token);

      // token is invalid
      if (!decodedToken) return false;

      const expiresAt = decodedToken.exp * 1000;

      // No need to refresh if token exists and expires in more than a day
      if (expiresAt > Date.now() && expiresAt - Date.now() > 24 * 3600 * 1000) {
        return true;
      }

      console.log('refresh token !!!', token, expiresAt);
    },
    fetchAccessToken: async () => {
      const token = getToken();

      if (!token) return false;

      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          query: `mutation {
                    refreshToken(input: {}) {
                      jwtToken
                    }
                  }`,
        }),
      });

      return response.json();
    },
    handleFetch: (newToken) => {
      // save new authentication token to state
      const { exp } = jwt.decode(newToken);
      document.cookie = `token=${newToken}; Path=/; SameSite=Strict; Expires=${new Date(
        exp * 1000
      )}`;
    },
    handleResponse: (operation, accessTokenField) => (response) => {
      if (!response || !response.data || !response.data.refreshToken)
        return { jwtToken: null };
      return response.data.refreshToken;
    },
    handleError: (error) => {
      console.error('Cannot refresh access token:', error);

      if (ctx && ctx.req.headers.cookie) {
        ctx.res.setHeader(
          'Set-Cookie',
          'token=expired; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        );
      } else if (typeof window !== 'undefined') {
        document.cookie =
          'token=expired; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
    },
  });

  return new ApolloClient({
    ssrMode: Boolean(ctx),
    link: ApolloLink.from([
      onError(({ operation, graphQLErrors, networkError, forward }) => {
        if (networkError) {
          if (
            networkError.statusCode === 401 ||
            (networkError.statusCode === 403 &&
              graphQLErrors[0].message === 'jwt malformed')
          ) {
            // retrying without token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: '',
              },
            });
            return forward(operation);
          } else console.log(`[Network error]: ${networkError}`);
        }

        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
      }),
      refreshLink,
      requestLink,
      createUploadLink({
        uri: graphqlUrl,
        credentials: 'same-origin',
        fetch,
      }),
    ]),
    cache: new InMemoryCache({
      dataIdFromObject: o => o.id,
    }).restore(initialState),
  });
}
