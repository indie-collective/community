import React from 'react';
import { Heading, Pane, Paragraph, Spinner } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from '../components/App';

import eventQuery from '../gql/event';

const EventDialog = ({ id, navigate }) => {
  const [event] = useQuery({ query: eventQuery, variables: { id }});

  if (!event.data) {
    return (
      <App>
        <Spinner size={24} />
      </App>
    );
  }

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={800}>{event.data.event.name}</Heading>
        <Heading size={600}>{event.data.event.location.city}, {event.data.event.location.country}</Heading>
        <Heading size={200}>{new Date(event.data.event.startAt).toLocaleDateString()} - {new Date(event.data.event.endAt).toLocaleDateString()}</Heading>
        <Paragraph>
          {event.data.event.about}
        </Paragraph>
      </Pane>
    </App>
  );  
}

export default EventDialog;
