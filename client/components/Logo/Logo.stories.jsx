import React from 'react';
import { storiesOf } from '@storybook/react';

import Logo from '.';

storiesOf('Organisms/Metadata', module)
  .add('default', () => (
    <Logo />
  ));