import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import GameForm from '.';

storiesOf('GameForm', module)
  .add('default', () => (
    <div style={{ width: 500, padding: 15 }}>
      <GameForm onSubmit={action('onSubmit')} />
    </div>
  ));