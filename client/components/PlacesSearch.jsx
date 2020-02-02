import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Places = typeof window !== 'undefined' && require('places.js');

const propTypes = {
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit() {},
};

const CityInput = ({ onSubmit }) => {
  const input = useRef();

  useEffect(() => {
    const places = Places({
      container: input.current,
      options: {
        type: 'city',
      },
    });

    places.on('change', console.log);

    console.log(places);
  }, []);

  return (
    <div>
      <input type="text" aria-label="City" ref={input} />
    </div>
  );
};

CityInput.propTypes = propTypes;
CityInput.defaultProps = defaultProps;

export default CityInput;
// export default React.memo(CityInput, () => false);
