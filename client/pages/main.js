import React from 'react';
import { Label, Modal, Button } from 'semantic-ui-react';

import App from '../components/App';
import StructureList from '../components/StructureList';
import StructureForm from '../components/StructureForm';

const MainPage = () => (
  <App>
    <h1>Structures</h1>
    <Label.Group>
      <Label as='a' color='blue' image>
        2
        <Label.Detail>Assocation</Label.Detail>
      </Label>
      <Label as='a' color='blue' image>
        1
        <Label.Detail>Studio</Label.Detail>
      </Label>
    </Label.Group>
    <StructureList />
    <Modal
      size="small"
      trigger={
        <Button
          icon="add"
          size="huge"
          color="green"
        />
      }>
      <Modal.Header>Add structure</Modal.Header>
      <Modal.Content>
        <StructureForm />
      </Modal.Content>
      <Modal.Actions>
        <Button negative>No</Button>
        <Button positive icon='checkmark' labelPosition='right' content='Yes' />
      </Modal.Actions>
    </Modal>
  </App>
);

export default MainPage;
