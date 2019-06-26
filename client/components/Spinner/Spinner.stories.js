import React from 'react';
import { storiesOf } from '@storybook/react';

import Spinner from '.';

storiesOf('Elements/Spinner', module)
  .add('default', () => (
    <Spinner />
  ));