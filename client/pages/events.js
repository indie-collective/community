import React, { useState } from 'react';
import { Heading, Pane, Card, Button } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from '../components/App';
import EventList from '../components/EventList';
import EventForm from '../components/EventForm';

import meQuery from '../gql/me';

const EventsPage = ({children}) => {
  const me = useQuery({ query: meQuery })[0];
  const [isDialogVisible, setDialogVisible] = useState(false);

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={800} marginBottom={30}>Events</Heading>
        <Card marginBottom={30} border="default">
          <EventList />
        </Card>
        {me.data && me.data.me && me.data.me.email && (
          <Button
            appearance="primary"
            intent="success"
            iconBefore="add"
            onClick={() => setDialogVisible(true)}
          >
            Add Event
          </Button>
        )}
      </Pane>

      <EventForm
        visible={isDialogVisible}
        onClose={() => setDialogVisible(false)}
      />
    </App>
  );
};

export default EventsPage;
