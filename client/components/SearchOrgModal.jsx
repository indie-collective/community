import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
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
} from '@chakra-ui/react';

import useDebounce from '../hooks/useDebounce';

const searchOrgQuery = gql`
  query searchOrg($tokens: [EntityFilter!]!, $excludedIds: [UUID!]) {
    entities(filter: { and: $tokens, id: { notIn: $excludedIds } }, first: 10) {
      nodes {
        id
        name
        images {
          nodes {
            id
            thumbnail_url
          }
        }
        games {
          totalCount
        }
      }
    }
  }
`;

const SearchOrgModal = ({ isOpen, excludedIds, onClose, onSelect }) => {
  const [value, setValue] = useState('');
  const [searchOrg, { loading, data }] = useLazyQuery(searchOrgQuery);
  const debouncedValue = useDebounce(value, 300);
  const initialFocusRef = useRef();

  useEffect(() => {
    if (value.length > 2) {
      searchOrg({
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
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search Organization</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Input
            ref={initialFocusRef}
            type="text"
            placeholder="Search an organization..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            mb={2}
          />
          {value &&
            data &&
            (data.entities.nodes.length > 0 ? (
              <List mb={2}>
                {data.entities.nodes.map((org) => (
                  <ListItem
                    p={2}
                    key={org.id}
                    _hover={{ backgroundColor: 'gray.600', cursor: 'pointer' }}
                    onClick={() => {
                      onSelect(org);

                      setValue('');
                      onClose();
                    }}
                  >
                    {org.name}
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

SearchOrgModal.defaultProps = {
  isOpen: true,
  excludedIds: [],
  onClose: () => {},
  onSelect: () => {},
};

SearchOrgModal.propTypes = {
  isOpen: PropTypes.bool,
  excludedIds: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};

export default SearchOrgModal;
