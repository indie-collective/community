import React from 'react';
import { useRoutes } from 'hookrouter';

import routes from '../../routes';
import Navigation from '/components/Navigation';

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
