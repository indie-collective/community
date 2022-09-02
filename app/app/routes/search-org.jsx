import { json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
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
  Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import useDebounce from '../hooks/useDebounce';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const search = getFullTextSearchQuery(q);

  const excludedIds = searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  try {
    const data = await db.entity.findMany({
      where: {
        name: {
          search,
        },
        id: {
          notIn: excludedIdsArray,
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });

    return json(data);
  } catch (err) {
    console.error(err);
    return json({ error: 'Something went wrong' });
  }
}

export const SearchOrgModal = ({ isOpen, excludedIds, onClose, onSelect }) => {
  const [value, setValue] = useState('');
  const orgs = useFetcher();
  const debouncedValue = useDebounce(value, 300);
  const initialFocusRef = useRef();

  useEffect(() => {
    if (value.length > 2) {
      const variables = { q: value };

      if (excludedIds.length > 0) variables.notId = excludedIds;

      orgs.submit(variables, {
        action: '/search-org',
      });
    }
  }, [debouncedValue]);

  return (
    <Modal initialFocusRef={initialFocusRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Search Org</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <orgs.Form method="get" action="/search-org">
            {excludedIds.map((id) => (
              <Input key={id} type="hidden" name="notId" value={id} />
            ))}

            <Input
              ref={initialFocusRef}
              type="text"
              name="q"
              placeholder="Search a org..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              mb={2}
            />
            {orgs.data && (
              <Box>
                {orgs.data.error ? (
                  <Text>Failed to load orgs :(</Text>
                ) : orgs.data.length ? (
                  <List mb={2}>
                    {orgs.data.map((org) => (
                      <ListItem
                        p={2}
                        key={org.id}
                        _hover={{
                          backgroundColor: 'gray.600',
                          cursor: 'pointer',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onSelect(game);

                            setValue('');
                            onClose();
                          }
                        }}
                        onClick={() => {
                          onSelect(org);

                          setValue('');
                          onClose();
                        }}
                        tabIndex="0"
                      >
                        {org.name}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No results has been found.</Text>
                )}
              </Box>
            )}
          </orgs.Form>
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
