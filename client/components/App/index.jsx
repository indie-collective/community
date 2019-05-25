import React from 'react';

import Navigation from 'components/Navigation';

const App = ({ children }) => (
  <div className="container">
    <Navigation />
    <div style={{ paddingTop: 90 }}>
      {children}
    </div>      
  </div>
);

export default App;
