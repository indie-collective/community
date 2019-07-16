import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const AutoSelect = ({ onSubmit }) => {
  const [value, setValue] = useState();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  function fetchSuggestions(value) {
    if (value.length < 3) {
      setSuggestions([]);
    } else {
      setLoading(true);
      setTimeout(() => {
        setSuggestions(Array.from({ length: 5 }, Math.random));
        setLoading(false);
      }, 500);
    }
  }

  return (
    <div className="dropdown is-active">
      <div className={loading ? 'control is-loading' : 'control'}>
        <input
          className="input"
          type="text"
          placeholder="Text input"
          value={value}
          onChange={e => {
            setValue(e.target.value);
            fetchSuggestions(e.target.value);
          }}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {suggestions.map(item => (
              <a key={item} role="button" className="dropdown-item" onClick={() => {
                setValue(item);
                setSuggestions([]);
              }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AutoSelect.propTypes = propTypes;

export default AutoSelect;
