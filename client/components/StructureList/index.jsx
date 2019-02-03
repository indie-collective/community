import React from 'react';
import { Connect, query, mutation } from 'urql';
import { Segment, Dimmer, Loader, Table, Flag } from 'semantic-ui-react';

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

const structureTypes = [
  { text: 'studio', value: 'STUDIO' },
  { text: 'association', value: 'ASSOCIATION' },
  { text: 'organisation', value: 'ORGANISATION' },
];

const StructureList = () => (
  <Connect query={query(allStructures)}>
    {({ loaded, fetching, data }) => (
      <Segment>
        <Dimmer active={fetching && !loaded}>
          <Loader />
        </Dimmer>

        <Table basic>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>About</Table.HeaderCell>
              <Table.HeaderCell>Location</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
      
          <Table.Body>
            {loaded && data.allStructures.map(({ type, name, about, location }) => (
              <Table.Row key={name}>
                <Table.Cell collapsing>{type}</Table.Cell>
                <Table.Cell collapsing>{name}</Table.Cell>
                <Table.Cell>{about}</Table.Cell>
                <Table.Cell collapsing><Flag name={location.country.toLowerCase()} /> {location.city}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Segment>
    )}
  </Connect>
);

export default StructureList;
