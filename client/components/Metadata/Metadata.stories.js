import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';

import Metadata from '.';

const data = {
  'Platform': 'PC',
  'Release date': new Date,
};

storiesOf('Organisms/Metadata', module)
  .add('default', () => (
    <Metadata data={data} />
  ));