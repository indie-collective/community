import React from 'react';
import { useQuery } from 'urql';
import { Table } from 'evergreen-ui';
import { navigate } from '@reach/router';

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

const EventList = () => {
  const [res] = useQuery({ query: allEvents });

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Name</Table.TextHeaderCell>
        <Table.TextHeaderCell>About</Table.TextHeaderCell>
        <Table.TextHeaderCell>Schedule</Table.TextHeaderCell>
        <Table.TextHeaderCell>Location</Table.TextHeaderCell>
      </Table.Head>
  
      <Table.Body>
        {!res.fetching && res.data && res.data.allEvents.map(({ id, name, about, startAt, endAt, location }) => (
          <Table.Row key={name} isSelectable onSelect={() => navigate(`/events/${id}`)}>
            <Table.TextCell>{name}</Table.TextCell>
            <Table.TextCell>{about}</Table.TextCell>
            <Table.TextCell>{new Date(startAt).toLocaleDateString()} - {new Date(endAt).toLocaleDateString()}</Table.TextCell>
            <Table.TextCell>{location.city}, {location.country}</Table.TextCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default EventList;
