import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

const isProduction = process && process.env.NODE_ENV === 'production';

const graphqlUrl = isProduction
  ? 'https://community.indieco.xyz/graphql'
  : 'http://localhost:4000/graphql';

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  const getToken = async () => {
    const response = await fetch('/api/token');
    const { accessToken } = await response.json();

    return accessToken;
  };

  const request = async (operation) => {
    const token = await getToken();

    if (token) {
      operation.setContext((prev) => ({
        headers: {
          authorization:
            prev.headers?.authorization === '' ? '' : `Bearer ${token}`,
        },
      }));
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
      requestLink,
      createUploadLink({
        uri: graphqlUrl,
      }),
    ]),
    cache: new InMemoryCache({
      dataIdFromObject: (o) => o.id,
      typePolicies: {
        Person: {
          fields: {
            avatar: { merge: true },
          },
        },
      },
    }).restore(initialState),
  });
}
