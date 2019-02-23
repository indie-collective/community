import React, { useState } from 'react';
import { Heading, Pane, Card, Button } from 'evergreen-ui';

import App from '../components/App';
import EventList from '../components/EventList';
import EventDialog from '../components/EventDialog';

const EventsPage = ({children}) => {
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
        >
          Add Event
        </Button>
      </Pane>

      <EventDialog
        visible={isDialogVisible}
        onClose={() => setDialogVisible(false)}
      />
    </App>
  );
};

export default EventsPage;
