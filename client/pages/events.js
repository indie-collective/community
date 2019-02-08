import React from 'react';
import { Heading, Pane } from 'evergreen-ui';

import App from '../components/App';

const EventsPage = () => (
  <App>
    <Pane maxWidth={800} margin="auto">
      <Heading size={800} marginBottom={30}>Events</Heading>
    </Pane>
  </App>
);

export default EventsPage;
