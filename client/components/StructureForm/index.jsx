import React, { useState } from 'react';
import { Connect, mutation } from 'urql';
import { Segment, Input, Select, Form, TextArea } from 'semantic-ui-react';

import { countryOptions } from './countries';

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

const structureTypes = [
  { text: 'studio', value: 'STUDIO' },
  { text: 'association', value: 'ASSOCIATION' },
  { text: 'organisation', value: 'ORGANISATION' },
];

const StructureList = () => {

  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  return (
    <Connect
      mutation={{
        createStructure: mutation(createStructure),
      }}
    >
      {({ createStructure }) => (
        <Form
          onSubmit={() => {
            createStructure({ type, name, about, country, city });
            setType('');
            setName('');
            setAbout('');
            setCountry('');
            setCity('');
          }}
        >
          <Form.Group widths="equal">
            <Form.Field>
              <Select 
                name="type"
                options={structureTypes}
                placeholder="Type…"
                value={type}
                onChange={(e, data) => setType(data.value)}
              />
            </Form.Field>
            <Form.Field>
              <input
                name="name"
                placeholder="Name…"
                value={name}
                text={name}
                onChange={e => setName(e.target.value)}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group>
            <TextArea
              name="about"
              placeholder="About…"
              value={about}
              onChange={(e, data) => setAbout(data.value)}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field>
              <Select
                name="country"
                options={countryOptions}
                placeholder="Country"
                value={country}
                onChange={(e, data) => setCountry(data.value)}
              />
            </Form.Field>
            <Form.Field>
              <Input
                name="city"
                placeholder="City"
                value={city}
                onChange={(e, data) => setCity(data.value)}
              />
            </Form.Field>
          </Form.Group>

          <Form.Button content='Add' />
        </Form>
      )}
    </Connect>
  );
}


export default StructureList;
