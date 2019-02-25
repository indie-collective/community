import React from 'react';

import Navigation from '../Navigation';

const App = ({ children }) => (
  <div>
    <Navigation />
    <div style={{ paddingTop: 90 }}>
      {children}
    </div>
  </div>
);

export default App;
