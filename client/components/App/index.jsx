import React from 'react';
import { print } from 'graphql';
import { filter, pipe, tap } from 'wonka';
import {
  createClient,
  cacheExchange,
  debugExchange,
  fetchExchange,
  Provider,
} from 'urql';

import Navigation from '../Navigation';

const testExchange = ({ forward }) => {
  return ops$ => {
    const preFlight$ = pipe(
      ops$,
      filter(operation => {
        if (operation.operationName !== 'mutation') {
          return true;
        }

        if (!operation.variables.file) {
          return true;
        }

        const { url } = operation.context;
        const { file } = operation.variables;

        const extraOptions =
          typeof operation.context.fetchOptions === 'function'
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        const fetchOptions = {
          method: 'POST',
          headers: {
            ...extraOptions.headers,
          },
        };

        fetchOptions.body = new FormData()

        fetchOptions.body.append(
          'operations',
          JSON.stringify({
            query: print(operation.query),
            variables: Object.assign({}, operation.variables, { file: null }),
          }),
        )

        fetchOptions.body.append(
          'map',
          JSON.stringify({
            0: ['variables.file'],
          })
        )

        fetchOptions.body.append(0, file, file.name)

        fetch(url, fetchOptions)
          .then(res => res.json())
          .then(json => console.log(json));

        return false;
      })
    );

    return forward(preFlight$);
  };
}

const host = (location.host.split(':')[0] === 'localhost') ? 'localhost:4000' : location.host;

const client = createClient({
  url: `${location.protocol}//${host}/graphql`,
  exchanges: [
    // debugExchange,
    testExchange,
    cacheExchange,
    fetchExchange,
  ],
  fetchOptions() {
    if (localStorage.key('token')) {
      return {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
    }
    return {};
  },
});

const App = ({ children }) => (
  <Provider value={client}>
    <Navigation />
    <div style={{ paddingTop: 90 }}>
      {children}
    </div>
  </Provider>
);

export default App;
