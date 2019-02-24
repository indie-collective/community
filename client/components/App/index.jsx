import React from 'react';
import { pipe, tap } from 'wonka';
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
    return pipe(
      ops$,
      // tap(op => console.log('[Exchange debug]: Incoming operation: ', op)),
      tap(op => {
        if (op.operationName === 'mutation' && op.variables && op.variables.file) {
          op.context.fetchOptions.body = new FormData()

          op.context.fetchOptions.body.append(
            'operations',
            JSON.stringify(op)
          )

          op.context.fetchOptions.body.append(
            'map',
            JSON.stringify(
              { 0: [op.variables.file.path] }
            )
          )

          op.context.fetchOptions.body.append(0, op.variables.file)
        }
      }),
      tap(op => { console.log(op) }),
      forward,
      // tap(result =>
      //   console.log('[Exchange debug]: Completed operation: ', result)
      // )
    );
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
