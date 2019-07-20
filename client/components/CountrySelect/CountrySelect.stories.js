import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import CountrySelect from '.';

storiesOf('CountrySelect', module)
  .add('default', () => (
    <CountrySelect value="fr" onChange={action('onchange')} />
  ));