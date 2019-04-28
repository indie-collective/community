import React from 'react';
import { arrayOf, shape, string } from 'prop-types';

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
  <div className={gridClasses[images.length] || styles.MoreImageGrid}>
    {images.map(({ url }) => (
      <img key={url} className={styles.Image} src={url} />
    ))}
  </div>
);

ImageGrid.propTypes = propTypes;
ImageGrid.defaultProps = defaultProps;

export default ImageGrid;
