import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, Observable } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch'

const isProduction = process && process.env.NODE_ENV === 'production';

const graphqlUrl = isProduction
  ? 'https://community.indieco.xyz/graphql'
  : 'http://localhost:4000/graphql';

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  const request = async (operation) => {
    let authorization;

    if (ctx) {
      authorization = ctx.req.authorization;
    }
    else if (localStorage.getItem('token')) {
      authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    if (authorization) {
      operation.setContext({
        headers: {
          authorization,
        },
      });
    }
  };

  const requestLink = new ApolloLink((operation, forward) =>
    new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => request(oper))
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
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      requestLink,
      new HttpLink({
        uri: graphqlUrl,
        credentials: 'same-origin',
        fetch,
      }),
    ]),
    cache: new InMemoryCache().restore(initialState),
  })
}