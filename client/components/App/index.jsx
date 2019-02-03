import React from 'react';
import { Provider, Client } from 'urql';
import { Container } from 'semantic-ui-react';

const client = new Client({
  url: 'http://localhost:4000',
});

const App = ({ children }) => (
  <Provider client={client}>
    <Container style={{ paddingTop: 30 }}>
      {children}
    </Container>
  </Provider>
);

export default App;
