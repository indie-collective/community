import React from 'react';
import { render } from 'react-dom';
import { Router } from '@reach/router';

import MainPage from './pages/main';

render(
  <Router>
    <MainPage path="/" />
  </Router>,
  document.getElementById('root')
);
