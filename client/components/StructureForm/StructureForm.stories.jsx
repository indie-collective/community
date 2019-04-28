import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import StructureForm from '.';

storiesOf('Organisms/StructureForm', module)
  .add('default', () => (
    <StructureForm onSubmit={action('onSubmit')} />
  ));