import React from 'react';
import {
  createClient,
  cacheExchange,
  debugExchange,
  fetchExchange,
  Provider,
} from 'urql';

import Navigation from '../Navigation';

const client = createClient({
  url: `http://localhost:4000/graphql`,
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
