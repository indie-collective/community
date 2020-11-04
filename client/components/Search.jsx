import React from 'react';
import PropTypes from 'prop-types';
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Spinner,
  Icon,
  Menu,
  MenuList,
  MenuItem,
} from '@chakra-ui/core';
import { useState } from 'react';

const propTypes = {
  loading: PropTypes.bool,
  results: PropTypes.arrayOf(PropTypes.string),
  onSearch: PropTypes.func,
};

const defaultProps = {
  loading: false,
  results: [],
  onSearch() {},
};

const Search = ({ loading, results, onSearch }) => {
  const [query, setQuery] = useState();

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }

  return (
    <Menu isOpen={results.length > 0}>
      <InputGroup>
        <InputLeftElement children={<Icon name="search" color="green.500" />} />
        <Input
          placeholder="Search"
          value={query}
          onChange={handleChange}
        />
        {loading && <InputRightElement children={<Spinner />} />}
      </InputGroup>

      <MenuList>
        {results.map(({ label, link }) => (
          <MenuItem>
            <span>{label}</span>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

Search.propTypes = propTypes;
Search.defaultProps = defaultProps;

export default Search;
