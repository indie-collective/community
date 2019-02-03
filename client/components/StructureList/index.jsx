import React from 'react';
import { Connect, query, mutation } from 'urql';
import { Segment, Dimmer, Loader, Table, Flag, Button, Menu, Icon } from 'semantic-ui-react';

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

const createStructure = `
  mutation(
    $type: StructureType!
    $name: String!
    $about: String!
    $country: String!
    $city: String!
  ) {
    createStructure(
      type: $type
      name: $name
      about: $about
      location: {
        country: $country
        city: $city
      }
    ) {
      type
      name
      about
      location {
        country
        city
      }
    }
  }
`

const StructureList = () => (
  <Connect
    query={query(allStructures)}
    mutation={{
      createStructure: mutation(createStructure),
    }}
  >
    {({ loaded, fetching, data }) => (
      <Segment>
        <Dimmer active={fetching && !loaded}>
          <Loader />
        </Dimmer>

        <Table basic="very" celled>
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
                <Table.Cell>{type}</Table.Cell>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{about}</Table.Cell>
                <Table.Cell><Flag name={location.country.toLowerCase()} /> {location.city}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          
          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Button
                  floated="right"
                  icon
                  labelPosition="left"
                  primary
                  size="small"
                  animated="vertical"
                >
                  <Button.Content hidden>Add Structure</Button.Content>
                  <Button.Content visible>
                    <Icon name="add" /> 
                  </Button.Content>
                </Button>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>

          {/* <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  <Menu.Item as='a'>1</Menu.Item>
                  <Menu.Item as='a'>2</Menu.Item>
                  <Menu.Item as='a'>3</Menu.Item>
                  <Menu.Item as='a'>4</Menu.Item>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer> */}
        </Table>
      </Segment>
    )}
  </Connect>
);

export default StructureList;
