import React, { useState, useEffect } from 'react';

import styles from './styles.css';

const LoadingImage = (props) => {
  const { src } = props;

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLoading(false);
    }
    img.src = src;
  }, [true]);

  if (loading) {
    return (
      <div
        className={styles.loading}
        style={{
          height: props.height || 100,
          width: props.width || 100,
        }}
      />
    );
  }

  return (
    <img {...props} />
  )
}

export default LoadingImage;
