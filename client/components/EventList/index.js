import React from 'react';
import { Connect, query } from 'urql';
import { Table } from 'evergreen-ui';

const allEvents = `
  {
    allEvents {
      id
      name
      about
      location {
        city
        country
      }
      # until the model changes
      startAt
      endAt
    }
  }
`;

const EventList = () => (
  <Connect query={query(allEvents)}>
    {({ loaded, fetching, data }) => (
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>About</Table.TextHeaderCell>
          <Table.TextHeaderCell>Schedule</Table.TextHeaderCell>
          <Table.TextHeaderCell>Location</Table.TextHeaderCell>
        </Table.Head>
    
        <Table.Body>
          {loaded && data.allEvents.map(({ type, name, about, startAt, endAt, location }) => (
            <Table.Row key={name} isSelectable onSelect={() => alert('hello')}>
              <Table.TextCell>{name}</Table.TextCell>
              <Table.TextCell>{about}</Table.TextCell>
              <Table.TextCell>{new Date(startAt).toLocaleDateString()} - {new Date(endAt).toLocaleDateString()}</Table.TextCell>
              <Table.TextCell>{location.city}, {location.country}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </Connect>
);

export default EventList;
