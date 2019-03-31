import React from 'react';
import { storiesOf } from '@storybook/react';
// import { text } from '@storybook/addon-knobs';

import LoginForm from '.';

storiesOf('Organisms/LoginForm', module)
  .add('default', () => (
    <LoginForm />
  ));