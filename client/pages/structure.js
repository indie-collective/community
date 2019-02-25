import React from 'react';
import { Heading, Pane, Paragraph, Spinner } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from '../components/App';

import structureQuery from '../gql/structure';

const StructurePage = ({ id }) => {
  const [structure] = useQuery({ query: structureQuery, variables: { id } });

  if (!structure.data) {
    return (
      <App>
        <Spinner size={24} />
      </App>
    );
  }

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={200}>{structure.data.structure.type}</Heading>
        <Heading size={800}>{structure.data.structure.name}</Heading>
        <Paragraph>
          {structure.data.structure.about}
        </Paragraph>
        <Heading size={600}>{structure.data.structure.location.city}, {structure.data.structure.location.country}</Heading>
      </Pane>
    </App>
  );  
}

export default StructurePage;