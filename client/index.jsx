import React from 'react';
import { render } from 'react-dom';

import { createClient, cacheExchange, fetchExchange, Provider } from 'urql';

import App from 'components/App';

import fileExchange from './fileExchange';

const host =
  location.host.split(':')[0] === 'localhost'
    ? 'localhost:5000'
    : location.host;

const client = createClient({
  url: `${location.protocol}//${host}/graphql`,
  exchanges: [cacheExchange, fileExchange, fetchExchange],
  fetchOptions() {
    if (localStorage.getItem('token') !== null) {
      return {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
    }
    return {};
  },
});

render(
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('root')
);
