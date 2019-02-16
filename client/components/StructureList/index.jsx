import React from 'react';
import { Link } from '@reach/router';
import { Connect, query, mutation } from 'urql';
import { Table, Popover, Position, TextDropdownButton, Menu } from 'evergreen-ui';

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

const Order = {
  NONE: 'NONE',
  ASC: 'ASC',
  DESC: 'DESC'
};

const structureTypes = [
  { text: 'studio', value: 'STUDIO' },
  { text: 'association', value: 'ASSOCIATION' },
  { text: 'organisation', value: 'ORGANISATION' },
];

const StructureList = () => (
  <Connect query={query(allStructures)}>
    {({ loaded, fetching, data }) => (
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Type</Table.TextHeaderCell>
          <Table.SearchHeaderCell
            onChange={value => console.log(value)}
            placeholder="Search by name…"
          />
          <Table.TextHeaderCell>About</Table.TextHeaderCell>
          <Table.HeaderCell>
            <Popover
              position={Position.BOTTOM_LEFT}
              content={({ close }) => (
                <Menu>
                  <Menu.OptionsGroup
                    title="Order"
                    options={[
                      { label: 'Ascending', value: Order.ASC },
                      { label: 'Descending', value: Order.DESC }
                    ]}
                    selected={null}
                    onChange={value => {
                      console.log(value);
                      close()
                    }}
                  />
                </Menu>
              )}
            >
              <TextDropdownButton
                icon="caret-down"
              >
                Location
              </TextDropdownButton>
            </Popover>
          </Table.HeaderCell>
        </Table.Head>
    
        <Table.Body>
          {loaded && data.allStructures.map(({ id, type, name, about, location }) => (
            <Table.Row key={name}>
              <Table.TextCell>{type}</Table.TextCell>
              <Table.TextCell>
                <Link to={`/structure/${id}`}>{name}</Link>
              </Table.TextCell>
              <Table.TextCell>{about}</Table.TextCell>
              <Table.TextCell>{location.city}, {location.country}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </Connect>
);

export default StructureList;
