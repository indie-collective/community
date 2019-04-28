import React from 'react';
import { Heading, Pane, Paragraph } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from 'components/App';

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

const StructurePage = ({ id }) => {
  const [res] = useQuery({
    query: structureQuery,
    variables: { id },
  });

  return (
    <App>
      {res.loaded && (
        <Pane maxWidth={800} margin="auto">
          <Heading size={200}>{res.data.structure.type}</Heading>
          <Heading size={800}>{res.data.structure.name}</Heading>
          <Paragraph>
            {res.data.structure.about}
          </Paragraph>
          <Heading size={600}>{res.data.structure.location.city}, {res.data.structure.location.country}</Heading>
        </Pane>
      )}
    </App>
  );  
}

export default StructurePage;
