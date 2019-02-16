import React, { useState } from 'react';
import { Heading, Pane, Paragraph } from 'evergreen-ui';
import { Connect, query } from 'urql';

import App from '../components/App';

const structureQuery = `
  query($id: ID!) {
    structure(id: $id) {
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

const StructurePage = ({ id }) => (
  <App>
    <Connect query={query(structureQuery, { id })}>
      {({ loaded, fetching, data }) => {
        return loaded && (
          <Pane maxWidth={800} margin="auto">
            <Heading size={200}>{data.structure.type}</Heading>
            <Heading size={800}>{data.structure.name}</Heading>
            <Paragraph>
              {data.structure.about}
            </Paragraph>
            <Heading size={600}>{data.structure.location.city}, {data.structure.location.country}</Heading>
          </Pane>
        );
      }}
    </Connect>
  </App>
);  

export default StructurePage;
