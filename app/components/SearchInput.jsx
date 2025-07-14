import { IconButton, InputGroup, Input } from '@chakra-ui/react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Form, useLocation, useNavigate } from '@remix-run/react';
import React, { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useColorModeValue } from '../components/ui/color-mode';

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
    <Form
      action="/search"
      method="get"
      onSubmit={(e) => {
        if (e.target.q.value === '') e.preventDefault();
      }}
    >
      <InputGroup
        w="auto"
        size="lg"
        startAddon={<FiSearch color="teal.500" />}
        endAddon={
          params.has('q') && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                variant="ghost"
                icon={<FiX />}
                onClick={() => handleChange('')}
              />
            </InputRightElement>
          )
        }
      >
        <Input
          ref={inputRef}
          name="q"
          placeholder="Search"
          defaultValue={params.get('q')}
          autoFocus={pathname === '/search'}
          bg={useColorModeValue('white', 'gray.750')}
          onChange={(e) => handleChange(e.target.value)}
        />
      </InputGroup>
    </Form>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
