import React from 'react';
import { Link } from '@reach/router';
import { useQuery, useMutation } from 'urql';
import { Table, Popover, Position, Menu, IconButton } from 'evergreen-ui';

const meQuery = `
  {
    me {
      email
    }
  }
`;

const allStructures = `
  {
    allStructures {
      id
      type
      name
      about
      location {
        city
        country
      }
    }
  }
`;

const deleteStructureMutation = `
  mutation deleteStructure ($id: ID!) {
    deleteStructure(id: $id) {
      id
      type
      name
      about
    }
  }
`;

const Order = {
  NONE: 'NONE',
  ASC: 'ASC',
  DESC: 'DESC'
};

const StructureList = () => {
  const me = useQuery({ query: meQuery })[0];
  const [res] = useQuery({ query: allStructures });
  const [_, deleteStructure] = useMutation(deleteStructureMutation);

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Type</Table.TextHeaderCell>
        <Table.TextHeaderCell>Name</Table.TextHeaderCell>
        <Table.TextHeaderCell>About</Table.TextHeaderCell>
        <Table.TextHeaderCell>Location</Table.TextHeaderCell>
        <Table.HeaderCell width={48} flex="none" />
      </Table.Head>
  
      <Table.Body>
        {!res.fetching && res.data && res.data.allStructures.map(({ id, type, name, about, location }) => (
          <Table.Row key={id}>
            <Table.TextCell>{type}</Table.TextCell>
            <Table.TextCell>
              <Link to={`/structure/${id}`}>{name}</Link>
            </Table.TextCell>
            <Table.TextCell>{about}</Table.TextCell>
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
                          onSelect={() => deleteStructure({ id })}
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

export default StructureList;
