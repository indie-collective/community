import React from 'react';
import { arrayOf, shape, string } from 'prop-types';
import { Container, Image } from 'react-bootstrap';

import styles from './styles.module.css';

const gridClasses = [
  styles.EmptyImageGrid,
  styles.SingleImageGrid,
  styles.TwoImageGrid,
  styles.ThreeImageGrid,
  styles.FourImageGrid,
  styles.FiveImageGrid,
];

const propTypes = {
  images: arrayOf(shape({
    url: string.isRequired,
  }))
}

const defaultProps = {
  images: [],
};

const ImageGrid = ({ images }) => (
  <Container className={gridClasses[images.length] || styles.MoreImageGrid}>
    {images.map(({ url }) => (
      <Image src={url} fluid rounded />
    ))}
  </Container>
);

ImageGrid.propTypes = propTypes;
ImageGrid.defaultProps = defaultProps;

export default ImageGrid;
