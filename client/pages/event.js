import React from 'react';
import { Heading, Pane, Paragraph, Dialog } from 'evergreen-ui';
import { Connect, query } from 'urql';

const eventQuery = `
  query getEvent($id: ID!) {
    event(id: $id) {
      id
      name
      about
      startAt
      endAt
      location {
        city
        country
      }
    }
  }
`;

const EventDialog = ({ id, navigate }) => (
  <Connect query={query(eventQuery, { id })}>
    {({ loaded, fetching, data }) => {
      return loaded && (
        <Dialog title={data.event.name} isShown onCloseComplete={() => navigate('/events')} hasFooter={false}>
          <Pane maxWidth={800} margin="auto">
            <Heading size={600}>{data.event.location.city}, {data.event.location.country}</Heading>
            <Heading size={200}>{new Date(data.event.startAt).toLocaleDateString()} - {new Date(data.event.endAt).toLocaleDateString()}</Heading>
            <Paragraph>
              {data.event.about}
            </Paragraph>
          </Pane>
        </Dialog>
      );
    }}
  </Connect>
);  

export default EventDialog;
