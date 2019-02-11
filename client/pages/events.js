import React, { useState } from 'react';
import { Heading, Pane, Card, Button } from 'evergreen-ui';

import App from '../components/App';
import EventList from '../components/EventList';

const EventsPage = () => {
  const [isDialogVisible, setDialogVisible] = useState(false);

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={800} marginBottom={30}>Events</Heading>
        <Card marginBottom={30} border="default">
          <EventList />
        </Card>
        <Button
          appearance="primary"
          intent="success"
          iconBefore="add"
          onClick={() => setDialogVisible(true)}
          disabled
        >
          Add Event
        </Button>
      </Pane>
    </App>
  );
};

export default EventsPage;
