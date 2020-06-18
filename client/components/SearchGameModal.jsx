import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ListItem,
  List,
  Input,
  Text,
} from '@chakra-ui/core';

import useDebounce from '../hooks/useDebounce';

const searchGameQuery = gql`
  query searchGame($tokens: [GameFilter!]!, $excludedIds: [UUID!]) {
    games(filter: { and: $tokens, id: { notIn: $excludedIds } }, first: 10) {
      nodes {
        id
        name
        images {
          nodes {
            id
            thumbnail_url
          }
        }
      }
    }
  }
`;

const SearchGameModal = ({ isOpen, excludedIds, onClose, onSelect }) => {
  const [value, setValue] = useState('');
  const [searchGame, { loading, data }] = useLazyQuery(searchGameQuery);
  const debouncedValue = useDebounce(value, 300);
  const initialFocusRef = useRef();

  useEffect(() => {
    if (value.length > 2) {
      searchGame({
        variables: {
          tokens: value
            .split(' ')
            .filter((s) => s.length > 2)
            .map((token) => ({
              name: {
                likeInsensitive: `%${token}%`,
              },
            })),
          excludedIds,
        },
      });
    }
  }, [debouncedValue]);

  return (
    <Modal
      preserveScrollBarGap
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search Game</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Input
            ref={initialFocusRef}
            type="text"
            placeholder="Search a game..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            mb={2}
          />
          {value &&
            data &&
            (data.games.nodes.length > 0 ? (
              <List mb={2}>
                {data.games.nodes.map((game) => (
                  <ListItem
                    p={2}
                    key={game.id}
                    _hover={{ backgroundColor: 'gray.600', cursor: 'pointer' }}
                    onClick={() => {
                      onSelect(game);

                      setValue('');
                      onClose();
                    }}
                  >
                    {game.name}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text>No results has been found.</Text>
            ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

SearchGameModal.defaultProps = {
  isOpen: true,
  excludedIds: [],
  onClose: () => {},
  onSelect: () => {},
};

SearchGameModal.propTypes = {
  isOpen: PropTypes.bool,
  excludedIds: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};

export default SearchGameModal;
