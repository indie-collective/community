import React from 'react';
import { Heading, Pane, Paragraph, Spinner } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from 'components/App';

import structureQuery from '/gql/structure';

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
        <Pane display="flex" alignItems="baseline">
          <Heading size={900} flex="1">{structure.data.structure.name}</Heading>
          <Heading size={600} flex="1" textAlign="right">
            {structure.data.structure.location.city}, {structure.data.structure.location.country}
          </Heading>
        </Pane>
        <Paragraph>
          {structure.data.structure.about}
        </Paragraph>
      </Pane>
    </App>
  );  
}

export default StructurePage;