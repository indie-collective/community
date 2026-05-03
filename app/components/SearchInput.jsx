import { IconButton, InputGroup, Input, Box } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';
import { Form, useLocation, useNavigate } from 'react-router';
import React, { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const propTypes = {};

const defaultProps = {};

const SearchInput = () => {
  const inputRef = useRef();
  const navigate = useNavigate();
  const { pathname, search, state } = useLocation();

  const params = new URLSearchParams(search);

  const handleChange = useDebouncedCallback((value) => {
    if (value !== '') {
      params.set('q', value);
      if (state?.prev || pathname.includes('search')) {
        // we have a previous page or we're already on search
        navigate(`search?${params.toString()}`, { replace: true, state });
      } else {
        // we're on a page, and we go to search, keeping the page in memory
        navigate(`search?${params.toString()}`, {
          state: {
            prev: pathname,
          },
        });
      }
    } else {
      // we have an empty search, we go back to the previous page or home
      navigate(state?.prev || '/', { replace: true });
      inputRef.current.value = '';
    }
  }, 300);

  return (
    <Box flex="1" width="100%">
      <Form
        action="/search"
        method="get"
        style={{ width: '100%' }}
        onSubmit={(e) => {
          if (e.target.q.value === '') e.preventDefault();
        }}
      >
        <InputGroup
          w="100%"
          size="lg"
          startElement={<LuSearch color="green.500" />}
          endElement={
            params.has('q') && (
              <IconButton
                aria-label="Clear search"
                variant="ghost"
                onClick={() => handleChange('')}
              >
                <LuX />
              </IconButton>
            )
          }
        >
          <Input
            ref={inputRef}
            name="q"
            placeholder="Search"
            defaultValue={params.get('q')}
            autoFocus={pathname === '/search'}
            bg={{ base: 'gray.100', _dark: 'gray.750' }}
            borderRadius="full"
            onChange={(e) => handleChange(e.currentTarget.value)}
          />
        </InputGroup>
      </Form>
    </Box>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
