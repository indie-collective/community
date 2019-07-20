import React, { useState, useEffect, useRef } from 'react';

import styles from './styles.module.css';

const Masonry = ({ children, gap, minWidth = 300 }) => {
  const cols = [];
  const ref = useRef();
  const [numCols, setNumCols] = useState(3);

  const calcNumCols = () =>
    setNumCols(Math.floor(ref.current.offsetWidth / minWidth));

  const createCols = () => {
    for (let i = 0; i < numCols; i++) cols[i] = [];
    children.forEach((child, i) => cols[i % numCols].push(child));
  };

  useEffect(() => {
    calcNumCols();
    window.addEventListener(`resize`, calcNumCols);
    return () => window.removeEventListener(`resize`, calcNumCols);
  });

  createCols();

  return (
    <div
      ref={ref}
      className={styles.Masonry}
    >
      {Array(numCols)
        .fill()
        .map((el, i) => (
          <div
            key={i}
            className={styles.Col}
          >
            {cols[i]}
          </div>
        ))}
    </div>
  );
};

export default Masonry;
