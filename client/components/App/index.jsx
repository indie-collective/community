import React from 'react';
import { useRoutes } from 'hookrouter';
import { useQuery, Provider } from 'urql';

import routes from '../../routes';
import Navigation from '/components/Navigation';

import CurrentPersonContext from '../CurrentPersonContext';

const App = () => {
  const routeResult = useRoutes(routes);

  const me = useQuery({
    query: `{
      currentPerson {
        id
      }
    }`,
    requestPolicy: 'network-only',
  })[0];

  if (me.data && !me.data.currentPerson) {
    localStorage.removeItem('jwt');
  }

  return (
    <CurrentPersonContext.Provider value={me.data ? me.data.currentPerson : null}>
      <div className="container is-fluid">
        <Navigation />
        {routeResult || <h1>404</h1>}
      </div>
    </CurrentPersonContext.Provider>
  );
};

export default App;
