import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import EventForm from '.';

storiesOf('Organisms/EventForm', module)
  .add('default', () => (
    <div style={{ width: 500, padding: 15 }}>
      <EventForm onSubmit={action('onSubmit')} />
    </div>
  ));