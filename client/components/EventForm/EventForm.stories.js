import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import EventForm from '.';

storiesOf('Organisms/EventForm', module)
  .add('default', () => (
    <EventForm onSubmit={action('onSubmit')} />
  ));