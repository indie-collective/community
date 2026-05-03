
import { useFetcher } from 'react-router';
import { List, Input, Text, Box, Dialog, Portal } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import computeGame from '../models/game';
import useDebounce from '../hooks/useDebounce';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const search = getFullTextSearchQuery(q);

  const excludedIds = searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  try {
    const games = await db.game.findMany({
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

    return await Promise.all(games.map(computeGame));
  } catch (err) {
    console.error(err);
    return { error: 'Something went wrong' };
  }
}

export const SearchGameModal = ({ isOpen, excludedIds, onClose, onSelect }) => {
  const [value, setValue] = useState('');
  const games = useFetcher();
  const debouncedValue = useDebounce(value, 300);
  const initialFocusRef = useRef();

  useEffect(() => {
    if (value.length > 2) {
      const variables = { q: value };

      if (excludedIds.length > 0) variables.notId = excludedIds;

      games.submit(variables, {
        action: '/search-game',
      });
    }
  }, [debouncedValue]);

  return (
    <Dialog.Root initialFocusEl={() => initialFocusRef.current} open={isOpen} onOpenChange={e => {
      if (!e.open) {
        onClose();
      }
    }}>
      <Portal>

        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Find Game</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <games.Form method="get" action="/search-game">
                {excludedIds.map((id) => (
                  <Input key={id} type="hidden" name="notId" value={id} />
                ))}

                <Input
                  ref={initialFocusRef}
                  type="text"
                  name="q"
                  placeholder="Search a game..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  mb={2}
                />
                {games.data && (
                  <Box>
                    {games.data.error ? (
                      <Text>Failed to load games :(</Text>
                    ) : games.data.length ? (
                      <List.Root mb={2}>
                        {games.data.map((game) => (
                          <List.Item
                            p={2}
                            key={game.id}
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
                              onSelect(game);

                              setValue('');
                              onClose();
                            }}
                            tabIndex="0"
                          >
                            {game.name}
                          </List.Item>
                        ))}
                      </List.Root>
                    ) : (
                      <Text>No results has been found.</Text>
                    )}
                  </Box>
                )}
              </games.Form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
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
