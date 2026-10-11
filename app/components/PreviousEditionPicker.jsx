import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

/**
 * The event's previous edition (#203), chosen by searching events by name;
 * sent as `previous_edition_id` (empty for none). `eventId` is the event
 * being edited, which can't be its own previous edition.
 */
const PreviousEditionPicker = ({ eventId, defaultValue = null }) => {
  const [chosen, setChosen] = useState(defaultValue);
  const [query, setQuery] = useState('');
  const search = useFetcher();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return undefined;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q, take: '6' });
      if (eventId) params.set('notId', eventId);
      search.load(`/search-event?${params}`);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search is stable
  }, [query, eventId]);

  const results = query.trim().length >= 2 && Array.isArray(search.data) ? search.data : [];

  return (
    <Box>
      <input type="hidden" name="previous_edition_id" value={chosen?.id ?? ''} />
      {chosen ? (
        <HStack>
          <Text>{chosen.name}</Text>
          <Button size="xs" variant="outline" onClick={() => setChosen(null)}>
            Remove
          </Button>
        </HStack>
      ) : (
        <Stack gap={1}>
          <Input
            aria-label="Search for the previous edition"
            placeholder="Stunfest 2025…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            // Enter picks nothing; it would submit the event form.
            onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
          />
          {results.map((event) => (
            <Button
              key={event.id}
              size="sm"
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => {
                setChosen(event);
                setQuery('');
              }}
            >
              {event.name}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PreviousEditionPicker;
