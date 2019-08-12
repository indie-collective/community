import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.string.isRequired,
};

const Person = ({ id }) => {
  // query

  return (
    <div>
      Person {id}
    </div>
  );
};

Person.propTypes = propTypes;

export default Person;
