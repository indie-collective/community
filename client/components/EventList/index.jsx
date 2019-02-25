import React from 'react';
import { useQuery, useMutation } from 'urql';
import { Table, Popover, Position, Menu, IconButton } from 'evergreen-ui';
import { navigate } from '@reach/router';

import meQuery from '../../gql/me';
import eventsQuery from '../../gql/events';
import deleteEventMutation from '../../gql/deleteEvent';

const EventList = () => {
  const me = useQuery({ query: meQuery })[0];
  const [events] = useQuery({ query: eventsQuery });
  const deleteEvent = useMutation(deleteEventMutation)[1];

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
        {!events.fetching && events.data && events.data.allEvents.map(({ id, name, about, startAt, endAt, location }) => (
          <Table.Row key={name} isSelectable onSelect={() => navigate(`/events/${id}`)}>
            <Table.TextCell>{name}</Table.TextCell>
            <Table.TextCell>{about}</Table.TextCell>
            <Table.TextCell>{new Date(startAt).toLocaleDateString()} - {new Date(endAt).toLocaleDateString()}</Table.TextCell>
            <Table.TextCell>{location.city}, {location.country}</Table.TextCell>
            <Table.Cell width={48} flex="none">
              {me.data && me.data.me && me.data.me.email && (
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
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default EventList;
