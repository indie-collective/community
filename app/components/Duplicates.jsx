import { Alert, Box, Button, Dialog, Input, Link as ChakraLink, List, Portal, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import Link from './Link';
import { toaster } from './ui/toaster';
import useDebounce from '../hooks/useDebounce';

const LABELS = { game: 'game', organization: 'studio or association', event: 'event' };

// Likely matches for a name (and website), from /duplicates.
const useLikely = (kind, name, { site, exclude } = {}) => {
  const fetcher = useFetcher();
  const debounced = useDebounce(`${name ?? ''}\n${site ?? ''}`, 400);
  useEffect(() => {
    const [n, s] = debounced.split('\n');
    if (n.trim().length < 2 && !s) return;
    const params = new URLSearchParams({ kind, name: n });
    if (s) params.set('site', s);
    if (exclude) params.set('exclude', exclude);
    fetcher.load(`/duplicates?${params}`);
    // fetcher is stable enough; reloading on its change would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, kind, exclude]);
  return (debounced.trim() && fetcher.data?.matches) || [];
};

/**
 * "Is it one of these?" under an add form's name (#346): records that may
 * be the one being added, before a second one is made.
 */
export const DuplicateHint = ({ kind, name, site }) => {
  const matches = useLikely(kind, name, { site });
  if (matches.length === 0) return null;
  return (
    <Alert.Root status="warning" mt={2} data-testid="duplicate-hint">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Is it one of these?</Alert.Title>
        <Alert.Description>
          <List.Root ps={4}>
            {matches.map((match) => (
              <List.Item key={match.id}>
                <ChakraLink asChild>
                  <Link to={match.path} target="_blank">
                    {match.name}
                  </Link>
                </ChakraLink>{' '}
                <Text as="span" color="muted" fontSize="sm">
                  ({match.reason})
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
};

/** Members report that a record is the same as another (#346). */
export const ReportDuplicate = ({ kind, id, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const matches = useLikely(kind, query, { exclude: id });
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.flagged) {
      toaster.create({ title: 'Thanks! An admin will check it.', type: 'success' });
      onClose();
    }
    // Once per report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);
  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Report a duplicate</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text mb={3}>Which {LABELS[kind]} is this the same as?</Text>
              <Input
                aria-label={`Search for the same ${LABELS[kind]}`}
                placeholder="Its name…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                mb={3}
              />
              <Box>
                {matches.map((match) => (
                  <Button
                    key={match.id}
                    variant="ghost"
                    width="100%"
                    justifyContent="flex-start"
                    loading={fetcher.state !== 'idle'}
                    onClick={() =>
                      fetcher.submit({ kind, id, other: match.id }, { method: 'post', action: '/duplicates/flag' })
                    }
                  >
                    {match.name}
                  </Button>
                ))}
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
