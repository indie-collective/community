import React from 'react';
import { Provider, Client } from 'urql';
import { Container } from 'semantic-ui-react';

import Navigation from '../Navigation';

const client = new Client({
  url: 'http://localhost:4000',
});

const App = ({ children }) => (
  <Provider client={client}>
    <Navigation />
    <Container style={{ paddingTop: 90 }}>
      {children}
    </Container>
  </Provider>
);

export default App;
