import React from 'react';
import { useRoutes } from 'hookrouter';

import HomePage from '../../pages/home';
import GamesPage from '../../pages/games';
import CreateGame from '../../pages/createGame';

import Navigation from 'components/Navigation';

const routes = {
  '/': () => <HomePage />,
  '/games': () => <GamesPage />,
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
