import React, { useState } from 'react';
import { Heading, Button, Pane, Card } from 'evergreen-ui';
import { useQuery } from 'urql';

import App from '../components/App';
import StructureList from '../components/StructureList';
import StructureDialog from '../components/StructureDialog';

import meQuery from '../gql/me';

const StructuresPage = () => {
  const me = useQuery({ query: meQuery })[0];
  const [isDialogVisible, setDialogVisible] = useState(false);

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={800} marginBottom={30}>Structures</Heading>
        <Card marginBottom={30} border="default">
          <StructureList />
        </Card>
        {me.data && me.data.me && me.data.me.email && (
          <Button
            appearance="primary"
            intent="success"
            iconBefore="add"
            onClick={() => setDialogVisible(true)}
          >
            Add Structure
          </Button>
        )}
      </Pane>

      <StructureDialog
        visible={isDialogVisible}
        onClose={() => setDialogVisible(false)}
      />
    </App>
  );  
}

export default StructuresPage;
