import React from 'react';
import { Heading, Pane, Paragraph, Spinner } from 'evergreen-ui';
import { Query } from 'urql';

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
    <Query query={structureQuery} variables={{ id }}>
      {({ data }) => {
        if (!data) {
          return <Spinner size={24} />;
        }

        return (
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
    </Query>
  </App>
);  

export default StructurePage;