import React from 'react';
import { render } from 'react-dom';
import { Router, Redirect } from '@reach/router';

import StructuresPage from './pages/structures';
import EventsPage from './pages/events';
import GamesPage from './pages/games';
import PeoplePage from './pages/people';

import StructurePage from './pages/structure';

render(
  <Router>
    <Redirect from="/" to="/structures" />
    <StructuresPage path="/structures" />
    <EventsPage path="/events" />
    <GamesPage path="/games" />
    <PeoplePage path="/people" />
    <StructurePage path="/structure/:id" />
  </Router>,
  document.getElementById('root')
);
