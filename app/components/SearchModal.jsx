import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  List,
  ListItem,
  Input,
  Text,
  Box,
} from '@chakra-ui/react';
import { Link, useFetcher } from '@remix-run/react';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';

import useDebounce from '../hooks/useDebounce';

const SearchModal = ({ isOpen, onClose }) => {
  const [value, setValue] = useState('');
  const fetcher = useFetcher();
  const debouncedValue = useDebounce(value, 300);
  const initialFocusRef = useRef();

  useEffect(() => {
    if (value.length > 2) {
      const variables = { q: value };
      fetcher.submit(variables, { action: '/search' });
    }
  }, [debouncedValue]);

  const data = fetcher.data;

  return (
    <Modal initialFocusRef={initialFocusRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <fetcher.Form method="get" action="/search">
            <Input
              ref={initialFocusRef}
              type="text"
              name="q"
              placeholder="Search..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              mb={2}
            />
          </fetcher.Form>
          {data && (
            <Box>
              {data.error ? (
                <Text>Failed to load results :(</Text>
              ) : data.games.length || data.orgs.length || data.events.length ? (
                <>
                  {data.games.length > 0 && (
                    <Box mb={2}>
                      <Text fontWeight="bold" mb={1}>
                        Games
                      </Text>
                      <List mb={2}>
                        {data.games.map((game) => (
                          <ListItem
                            p={2}
                            key={`game-${game.id}`}
                            _hover={{ backgroundColor: 'gray.600', cursor: 'pointer' }}
                            as={Link}
                            to={`/game/${game.id}`}
                            onClick={onClose}
                          >
                            {game.name}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {data.orgs.length > 0 && (
                    <Box mb={2}>
                      <Text fontWeight="bold" mb={1}>
                        Organizations
                      </Text>
                      <List mb={2}>
                        {data.orgs.map((org) => (
                          <ListItem
                            p={2}
                            key={`org-${org.id}`}
                            _hover={{ backgroundColor: 'gray.600', cursor: 'pointer' }}
                            as={Link}
                            to={`/org/${org.id}`}
                            onClick={onClose}
                          >
                            {org.name}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {data.events.length > 0 && (
                    <Box mb={2}>
                      <Text fontWeight="bold" mb={1}>
                        Events
                      </Text>
                      <List mb={2}>
                        {data.events.map((event) => (
                          <ListItem
                            p={2}
                            key={`event-${event.id}`}
                            _hover={{ backgroundColor: 'gray.600', cursor: 'pointer' }}
                            as={Link}
                            to={`/event/${event.id}`}
                            onClick={onClose}
                          >
                            {event.name}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </>
              ) : (
                <Text>No results has been found.</Text>
              )}
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

SearchModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
};

SearchModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default SearchModal;
