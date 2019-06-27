import React from 'react';
import { useRoutes } from 'hookrouter';

import HomePage from '../../pages/home';
import GamesPage from '../../pages/games';
import GamePage from '../../pages/game';
import CreateGame from '../../pages/createGame';

import Navigation from 'components/Navigation';

const routes = {
  '/': () => <HomePage />,
  '/games': () => <GamesPage />,
  '/game/:id': ({id}) => <GamePage id={Number.parseInt(id)} />,
  '/game/create': () => <CreateGame />,
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
