import React from 'react';
import { Header, Icon } from 'semantic-ui-react';

import App from '../components/App';
import StructureList from '../components/StructureList';

const MainPage = () => (
  <App>
    <Header as='h2' icon textAlign='center'>
      <Icon name='users' circular />
      <Header.Content>Structures</Header.Content>
    </Header>
    <StructureList />
  </App>
);

export default MainPage;
