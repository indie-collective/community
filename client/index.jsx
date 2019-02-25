import React from 'react';
import { render } from 'react-dom';
import { Router, Redirect } from '@reach/router';
import {
  createClient,
  cacheExchange,
  fetchExchange,
  Provider,
} from 'urql';

import StructuresPage from './pages/structures';
import EventsPage from './pages/events';
import GamesPage from './pages/games';
import PeoplePage from './pages/people';

import StructurePage from './pages/structure';
import EventDialog from './pages/event';

import Navigation from './components/Navigation';

import fileExchange from './fileExchange';

const host = (location.host.split(':')[0] === 'localhost') ? 'localhost:4000' : location.host;

const client = createClient({
  url: `${location.protocol}//${host}/graphql`,
  exchanges: [
    cacheExchange,
    fileExchange,
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

render(
  <Provider value={client}>
    <Router>
      <Redirect from="/" to="/structures" />
      <StructuresPage path="/structures" />
      <EventsPage path="/events">
        <EventDialog path=":id" />
      </EventsPage>
      <GamesPage path="/games" />
      <PeoplePage path="/people" />
      <StructurePage path="/structure/:id" />
    </Router>
  </Provider>,
  document.getElementById('root')
);
