import React from 'react';
import { useRoutes } from 'hookrouter';

import HomePage from '../../pages/home';

import GamesPage from '../../pages/games';
import GamePage from '../../pages/game';
import CreateGame from '../../pages/createGame';

import EntitiesPage from '../../pages/entities';
import EntityPage from '../../pages/entity';
import CreateEntity from '../../pages/createEntity';

import PeoplePage from '../../pages/people';
import PersonPage from '../../pages/person';
import CreatePerson from '../../pages/createPerson';

import EventsPage from '../../pages/events';
import EventPage from '../../pages/event';
import CreateEvent from '../../pages/createEvent';

import TagsPage from '../../pages/tags';
import TagPage from '../../pages/tag';

import Navigation from 'components/Navigation';

const routes = {
  '/': () => <HomePage />,

  '/games': () => <GamesPage />,
  '/game/:id': ({id}) => <GamePage id={Number.parseInt(id)} />,
  '/game/create': () => <CreateGame />,

  '/entities': () => <EntitiesPage />,
  '/entities/:id': ({id}) => <EntityPage id={Number.parseInt(id)} />,
  '/entities/create': () => <CreateEntity />,
  
  '/people': () => <PeoplePage />,
  '/person/:id': ({id}) => <PersonPage id={Number.parseInt(id)} />,
  '/person/create': () => <CreatePerson />,
  
  '/events': () => <EventsPage />,
  '/event/:id': ({id}) => <EventPage id={Number.parseInt(id)} />,
  '/event/create': () => <CreateEvent />,

  '/tags': () => <TagsPage />,
  '/tag/:id': ({id}) => <TagPage id={Number.parseInt(id)} />
};

const App = () => {
  const routeResult = useRoutes(routes);

  return (
    <div className="container">
      <Navigation />
      {routeResult || <h1>404</h1>}
    </div>
  );
};

export default App;
