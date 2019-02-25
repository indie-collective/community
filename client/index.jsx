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
import StructurePage from './pages/structure';
import StructureEditPage from './pages/structureEdit';

import EventsPage from './pages/events';
import EventPage from './pages/event';
import EventEditPage from './pages/eventEdit';

import GamesPage from './pages/games';
import PeoplePage from './pages/people';

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
      <StructurePage path="/structures/:id" />
      <StructureEditPage path="/structures/create" />

      <EventsPage path="/events" />
      <EventPage path="/events/:id" />
      <EventEditPage path="/events/create" />

      <GamesPage path="/games" />
      <PeoplePage path="/people" />
    </Router>
  </Provider>,
  document.getElementById('root')
);
