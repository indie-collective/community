import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import SignupForm from '.';

storiesOf('SignupForm', module)
  .add('default', () => (
    <div style={{ width: 500, padding: 15 }}>
      <SignupForm onSubmit={action('onSubmit')} />
    </div>
  ));