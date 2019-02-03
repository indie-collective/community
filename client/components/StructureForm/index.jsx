import React from 'react';
import { Connect, mutation } from 'urql';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Select, Form, TextArea } from 'semantic-ui-react';

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

const StructureList = () => (
  <Connect
    mutation={{
      createStructure: mutation(createStructure),
    }}
  >
    {({ createStructure }) => (
      <Formik
        onSubmit={(values) => {
          createStructure(values);
        }}
      >
        {({ handleChange, setFieldValue, handleSubmit }) => (
          <Form style={{ maxWidth: 400, margin: 'auto' }} onSubmit={handleSubmit}>
            <Form.Group widths="equal">
              <Form.Field>
                <Select 
                  name="type"
                  options={structureTypes}
                  placeholder="Type…"
                  onChange={(e, data) => setFieldValue('type', data.value)}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  name="name"
                  placeholder="Name…"
                  onChange={handleChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <TextArea
                name="about"
                placeholder="About…"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field>
                <Select
                  name="country"
                  options={countryOptions}
                  placeholder="Country"
                  onChange={(e, data) => setFieldValue('country', data.value)}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                />
              </Form.Field>
            </Form.Group>

            <Form.Button content='Add' />
          </Form>
        )}
      </Formik>
    )}
  </Connect>
);

export default StructureList;
