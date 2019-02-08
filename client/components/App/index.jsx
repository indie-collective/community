import React from 'react';
import { Provider, Client } from 'urql';

import Navigation from '../Navigation';

const client = new Client({
  url: 'http://localhost:4000',
  fetchOptions() {
    if (localStorage.key('token')) {
      return {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      };
    }
    return {};
  },
});

const App = ({ children }) => (
  <Provider client={client}>
    <Navigation />
    <div style={{ paddingTop: 90 }}>
      {children}
    </div>
  </Provider>
);

export default App;
