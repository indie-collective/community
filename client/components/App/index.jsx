import React from 'react';
// import { useQuery } from 'urql';
import { Container } from 'react-bootstrap';

// import { me as meQuery } from '/gql/me';

import Navigation from 'components/Navigation';

const App = ({ children }) => {
  // const [me, getMe] = useQuery({
  //   query: meQuery,
  //   requestPolicy: 'network-only',
  // });

  return (
    <Container>
      <Navigation />
      <div style={{ paddingTop: 90 }}>
        {children}
      </div>      
    </Container>
  );
};

export default App;
