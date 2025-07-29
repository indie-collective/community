import { IconButton, useDisclosure } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import SearchModal from './SearchModal';

const propTypes = {};

const defaultProps = {};

const SearchInput = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="Open search"
        variant="ghost"
        icon={<SearchIcon />}
        onClick={onOpen}
      />
      <SearchModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;

export default SearchInput;
