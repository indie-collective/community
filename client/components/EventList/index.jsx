import React from 'react';
import { useQuery, useMutation } from 'urql';
import { Table, Popover } from 'evergreen-ui';
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

const deleteEventMutation = `
  mutation deleteEvent ($id: ID!) {
    deleteEvent(id: $id) {
      id
      name
      about
      startAt
      endAt
    }
  }
`;

const EventList = () => {
  const [res] = useQuery({ query: allEvents });
  const [_, deleteEvent] = useMutation(deleteEventMutation);

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Name</Table.TextHeaderCell>
        <Table.TextHeaderCell>About</Table.TextHeaderCell>
        <Table.TextHeaderCell>Schedule</Table.TextHeaderCell>
        <Table.TextHeaderCell>Location</Table.TextHeaderCell>
        <Table.HeaderCell width={48} flex="none" />
      </Table.Head>
  
      <Table.Body>
        {!res.fetching && res.data && res.data.allEvents.map(({ id, name, about, startAt, endAt, location }) => (
          <Table.Row key={name} isSelectable onSelect={() => navigate(`/events/${id}`)}>
            <Table.TextCell>{name}</Table.TextCell>
            <Table.TextCell>{about}</Table.TextCell>
            <Table.TextCell>{new Date(startAt).toLocaleDateString()} - {new Date(endAt).toLocaleDateString()}</Table.TextCell>
            <Table.TextCell>{location.city}, {location.country}</Table.TextCell>
            <Table.Cell width={48} flex="none">
              <Popover
                content={(
                  <Menu>
                    <Menu.Group>
                      <Menu.Item secondaryText="⌘R">Edit…</Menu.Item>
                    </Menu.Group>
                    <Menu.Divider />
                    <Menu.Group>
                      <Menu.Item
                        intent="danger"
                        onSelect={() => deleteEvent({ id })}
                      >
                        Delete…
                      </Menu.Item>
                    </Menu.Group>
                  </Menu>
                )}
                position={Position.BOTTOM_RIGHT}
              >
                <IconButton icon="more" height={24} appearance="minimal" />
              </Popover>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default EventList;
