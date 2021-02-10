import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
} from '@chakra-ui/react';
import { SmallCloseIcon, SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

const propTypes = {
  defaultValue: PropTypes.string,
};

const defaultProps = {};

const SearchInput = ({ defaultValue }) => {
  const { pathname, query, push, replace, back } = useRouter();

  return (
    <InputGroup w="auto">
      <InputLeftElement children={<SearchIcon color="teal.500" />} />
      <Input
        placeholder="Search"
        defaultValue={defaultValue}
        autoFocus={pathname === '/search'}
        onChange={(e) => {
          const { value } = e.target;

          // empty value => let's go previous page or home
          if (value === '') {
            query.prev ? back() : push('/');
            return;
          }

          // not on search => let's go!
          if (pathname !== '/search') {
            push(
              {
                pathname: '/search',
                query: {
                  prev: pathname,
                  q: value,
                },
              },
              '/search?q=' + value
            );
            return;
          }

          // typing stuff updates URL
          replace(
            {
              pathname: '/search',
              query: {
                prev: query.prev,
                q: value,
              },
            },
            '/search?q=' + value
          );
        }}
      />
      {query.q && query.q !== '' && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            variant="ghost"
            icon={<SmallCloseIcon />}
            // clearing value => let's go previous page or home
            onClick={() => (query.prev ? back() : push('/'))}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
