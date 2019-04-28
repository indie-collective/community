import React from 'react';
import { useQuery, useMutation } from 'urql';
import { Table, Heading, Popover, Position, Menu, IconButton, Spinner } from 'evergreen-ui';
import { Link } from '@reach/router';
import dateFormat from 'date-fns/format';

import meQuery from '/gql/me';
import eventsQuery from '/gql/events';
import deleteEventMutation from '/gql/deleteEvent';

const DateLabel = ({ from, to }) => {
  if (from.getMonth() === to.getMonth()) { // same month
    if (from.getDate() === to.getDate()) { // same day
      return dateFormat(from, 'Do [at] H:mm');
    }

    return `${dateFormat(from, 'Do')} to ${dateFormat(to, 'Do')}`;
  }

  return `${dateFormat(from, 'MMM Do YYYY')} to ${dateFormat(to, 'MMM Do YYYY')}`;
}

const EventList = () => {
  const me = useQuery({ query: meQuery })[0];
  const [events] = useQuery({ query: eventsQuery });
  const deleteEvent = useMutation(deleteEventMutation)[1];

  const data = events.data ? events.data.allEvents : [];

  if (events.fetching || events.loading) {
    return <Spinner />
  }

  return (
    <Table>
      <Table.Body>
        {events.data && events.data.allEvents.map(({ id, name, startAt, endAt, location, images }) => (
          <Table.Row key={id} height="auto" paddingTop={8} paddingBottom={8}>
            <Table.TextCell textAlign="right" width={120} flex="none">
              <Heading>{dateFormat(new Date(startAt), 'MMMM')}</Heading>
            </Table.TextCell>
            <Table.TextCell>
              <Heading>{dateFormat(new Date(startAt), 'Do')}</Heading>
            </Table.TextCell>
            <Table.TextCell>
              {new Date(startAt).getDate() < new Date(endAt).getDate() && (
                <Heading>{dateFormat(new Date(endAt), 'Do')}</Heading>
              )}
            </Table.TextCell>
            <Table.TextCell>
              {images.length > 0 && (
                <div
                  style={{
                    height: 100,
                    width: 150,
                    backgroundSize: 'cover',
                    backgroundImage: `url(http://localhost:5000/${images[0].id})`
                  }}
                />
              )}
            </Table.TextCell>
            <Table.TextCell>
              <Heading>
                <Link to={`/events/${id}`}>{name}</Link>
              </Heading>
              {location.city}, {location.country}
            </Table.TextCell>
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
