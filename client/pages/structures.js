import React, { useState } from 'react';
import { Heading, Button, Pane, Card } from 'evergreen-ui';

import App from '../components/App';
import StructureList from '../components/StructureList';
import StructureDialog from '../components/StructureDialog';

const StructuresPage = () => {
  const [isDialogVisible, setDialogVisible] = useState(false);

  return (
    <App>
      <Pane maxWidth={800} margin="auto">
        <Heading size={800} marginBottom={30}>Structures</Heading>
        <Card marginBottom={30} border="default">
          <StructureList />
        </Card>
        <Button
          appearance="primary"
          intent="success"
          iconBefore="add"
          onClick={() => setDialogVisible(true)}
        >
          Add Structure
        </Button>
      </Pane>

      <StructureDialog
        visible={isDialogVisible}
        onClose={() => setDialogVisible(false)}
      />
    </App>
  );  
}

export default StructuresPage;
