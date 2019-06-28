import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
};

const Entity = ({ id }) => {
  // query

  return (
    <div>
      Entity {id}
    </div>
  );
};

Entity.propTypes = propTypes;

export default Entity;
