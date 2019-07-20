import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';

import Hero from '.';

const game = {
  title: 'Indie Game Title',
  tagline: 'This is the game tagline which quickly describes the game.'
};

storiesOf('Hero', module)
  .add('default', () => (
    <Hero
      title={text('title', game.title)}
      tagline={text('tagline', game.tagline)}
    />
  ));