import React from 'react';
import { Heading, Pane, Paragraph, Dialog } from 'evergreen-ui';
import { Query } from 'urql';

import App from '../components/App';

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
  <Query query={eventQuery} variables={{ id }}>
    {({ loaded, data }) => {
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
  </Query>
);  

export default EventDialog;
