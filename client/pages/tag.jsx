import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
};

const Tag = ({ id }) => {
  // query

  return (
    <div>
      Tag {id}
    </div>
  );
};

Tag.propTypes = propTypes;

export default Tag;
