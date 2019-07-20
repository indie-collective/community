import React, { useState } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

const SearchBar = ({ results, loading, onSelect, onSearch }) => {
  return (
    <div className="dropdown is-active" style={{ display: 'flex' }}>
      <div
        className={`control is-expanded ${loading ? 'is-loading' : ''}`}
        style={{ flex: 1 }}
      >
        <input
          className="input is-rounded"
          type="text"
          placeholder="Search"
          onChange={e => {
            onSearch(e.target.value);
          }}
        />
      </div>
      {results && results.length > 0 && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {results.map(item => (
              <a
                key={item.key}
                role="button"
                className="dropdown-item"
                onClick={() => {
                  onSelect(item.key);
                }}
              >
                {item.render()}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
