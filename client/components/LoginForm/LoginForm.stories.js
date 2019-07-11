import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LoginForm from '.';

storiesOf('Organisms/LoginForm', module)
  .add('default', () => (
    <div style={{ width: 500, padding: 15 }}>
      <LoginForm onSubmit={action('onSubmit')} />
    </div>
  ));