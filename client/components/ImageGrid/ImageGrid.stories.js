import React from 'react';
import { storiesOf } from '@storybook/react';

import ImageGrid from '.';

const images = Array.from({ length: 10 })
  .map(() => ({ url: `https://picsum.photos/300/200?image=${Math.floor(Math.random() * 1084)}` }));

storiesOf('Organisms/ImageGrid', module)
  .add('empty', () => (
    <ImageGrid />
  ))
  .add('single image', () => (
    <ImageGrid images={images.slice(0, 1)} />
  ))
  .add('two images', () => (
    <ImageGrid images={images.slice(0, 2)} />
  ))
  .add('three images', () => (
    <ImageGrid images={images.slice(0, 3)} />
  ))
  .add('four images', () => (
    <ImageGrid images={images.slice(0, 4)} />
  ))
  .add('five images', () => (
    <ImageGrid images={images.slice(0, 5)} />
  ))
  .add('more images', () => (
    <ImageGrid images={images} />
  ));