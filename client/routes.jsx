import React from 'react';

import HomePage from '/pages/home';

import GamesPage from '/pages/games';
import GamePage from '/pages/game';
import CreateGame from '/pages/createGame';

import EntitiesPage from '/pages/entities';
import EntityPage from '/pages/entity';
import CreateEntity from '/pages/createEntity';

import PeoplePage from '/pages/people';
import PersonPage from '/pages/person';
import CreatePerson from '/pages/createPerson';

import EventsPage from '/pages/events';
import EventPage from '/pages/event';
import CreateEvent from '/pages/createEvent';

import TagsPage from '/pages/tags';
import TagPage from '/pages/tag';

import LoginPage from '/pages/login';
import SignupPage from '/pages/signup';

export default {
  '/': () => <HomePage />,

  '/games': () => <GamesPage />,
  '/game/create': () => <CreateGame />,
  '/game/:id': ({ id }) => <GamePage id={Number.parseInt(id)} />,

  '/entities': () => <EntitiesPage />,
  '/entities/create': () => <CreateEntity />,
  '/entities/:id': ({ id }) => <EntityPage id={Number.parseInt(id)} />,

  '/people': () => <PeoplePage />,
  '/person/create': () => <CreatePerson />,
  '/person/:id': ({ id }) => <PersonPage id={Number.parseInt(id)} />,

  '/events': () => <EventsPage />,
  '/event/create': () => <CreateEvent />,
  '/event/:id': ({ id }) => <EventPage id={Number.parseInt(id)} />,

  '/tags': () => <TagsPage />,
  '/tag/:id': ({ id }) => <TagPage id={Number.parseInt(id)} />,

  '/login': () => <LoginPage />,
  '/signup': () => <SignupPage />,
};