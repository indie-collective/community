import React from 'react';
import { Heading, Pane } from 'evergreen-ui';

import App from '../components/App';
import ImageUploader from '../components/ImageUploader';

const GamesPage = () => (
  <App>
    <Pane maxWidth={800} margin="auto">
      <Heading size={800} marginBottom={30}>Games</Heading>
      <ImageUploader />
    </Pane>
  </App>
);

export default GamesPage;
