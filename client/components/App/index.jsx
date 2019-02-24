import React from 'react';
import {
  createClient,
  cacheExchange,
  debugExchange,
  fetchExchange,
  Provider,
} from 'urql';

import Navigation from '../Navigation';

const host = (location.host.split(':')[0] === 'localhost') ? 'localhost:4000' : location.host;

const client = createClient({
  url: `${location.protocol}//${host}/graphql`,
  exchanges: [
    debugExchange,
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
