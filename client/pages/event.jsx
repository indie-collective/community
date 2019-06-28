import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  id: PropTypes.number.isRequired,
};

const Event = ({ id }) => {
  // query

  return (
    <div>
      Event {id}
    </div>
  );
};

Event.propTypes = propTypes;

export default Event;
