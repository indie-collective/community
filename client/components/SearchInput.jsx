import React from 'react';
import PropTypes from 'prop-types';
import {
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
} from '@chakra-ui/core';
import { useRouter } from 'next/router';

const propTypes = {
  defaultValue: PropTypes.string,
};

const defaultProps = {};

const SearchInput = ({ defaultValue }) => {
  const { pathname, query, push, replace } = useRouter();

  return (
    <InputGroup>
        <InputLeftElement children={<Icon name="search" color="teal.500" />} />
        <Input
          placeholder="Search"
          defaultValue={defaultValue}
          autoFocus={pathname === '/search'}
          onFocus={() => {
            if (pathname !== '/search') {
              push(
                {
                  pathname: '/search',
                  query: {
                    prev: pathname,
                  },
                },
                '/search'
              );
            }
          }}
          onBlur={() => {
            if (!query.q) {
              push({ pathname: query.prev || '/' });
            }
          }}
          onChange={(e) => {
            const { value } = e.target;

            replace(
              {
                pathname: '/search',
                query: { prev: query.prev, q: value },
              },
              value ? '/search?q=' + value : '/search'
            );
          }}
        />
      </InputGroup>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
