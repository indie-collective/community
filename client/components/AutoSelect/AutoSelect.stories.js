import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AutoSelect from '.';

storiesOf('AutoSelect', module)
  .add('default', () => (
    <div style={{ width: 300, padding: 15 }}>
      <AutoSelect onSubmit={action('onSubmit')} />
    </div>
  ));