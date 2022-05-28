import React from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
} from '@chakra-ui/react';
import { SmallCloseIcon, SearchIcon } from '@chakra-ui/icons';
import { Form, useLocation, useNavigate } from '@remix-run/react';

const propTypes = {
  defaultValue: PropTypes.string,
};

const defaultProps = {};

const SearchInput = ({ defaultValue }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const params = new URLSearchParams(search);

  return (
    <Form action='/search' method='get'>
      <InputGroup w="auto" ml={3}>
        <InputLeftElement children={<SearchIcon color="teal.500" />} />
        <Input
          name='q'
          placeholder="Search"
          defaultValue={params.get('q')}
          autoFocus={pathname === '/search'}
          onChange={(e) => {
            // e.target.form.submit();
          }}
        />
        {params.has('q') && (
          <InputRightElement>
            <IconButton
              aria-label="Clear search"
              variant="ghost"
              icon={<SmallCloseIcon />}
              // clearing value => let's go previous page or home
              onClick={() => navigate('/')}
            />
          </InputRightElement>
        )}
      </InputGroup>
    </Form>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
