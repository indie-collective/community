import React from 'react';
import PropTypes from 'prop-types';
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Spinner,
  Icon,
  Stack,
  List,
  ListItem,
} from '@chakra-ui/core';
import { useCombobox } from 'downshift';

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

const Search = ({
  loading,
  results,
  renderResult,
  itemToString,
  onSearch,
  onSelect,
}) => {
  const {
    isOpen,
    getComboboxProps,
    getInputProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items: results,
    itemToString,
    onInputValueChange({ inputValue }) {
      onSearch(inputValue);
    },
    onSelectedItemChange({ inputValue }) {
      onSelect(inputValue);
    },
  });

  return (
    <Stack>
      <InputGroup {...getComboboxProps()}>
        <InputLeftElement children={<Icon name="search" color="green.500" />} />
        <Input placeholder="Search" {...getInputProps()} />
        {loading && <InputRightElement children={<Spinner />} />}
      </InputGroup>

      {isOpen && (
        <List {...getMenuProps()} bg="white" rounded={5} borderColor="gray.600">
          {results.map((item, index) => (
            <ListItem
              key={`${item}${index}`}
              rounded={5}
              color="gray.800"
              background={highlightedIndex === index ? 'yellow' : 'white'}
              px={3}
              py={2}
              {...getItemProps({ item, index })}
            >
              {renderResult(item)}
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
};

Search.propTypes = propTypes;
Search.defaultProps = defaultProps;

export default Search;
