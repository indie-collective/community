import { Alert, Button, Field, HStack, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuLink } from 'react-icons/lu';
import { useFetcher } from 'react-router';

const SOURCES = { steam: 'Steam', itch: 'itch.io', bluesky: 'Bluesky', website: 'the page' };
const EXAMPLES = {
  game: 'Its Steam or itch.io page, or its website',
  organization: 'Its website or Bluesky profile',
  event: 'Its page or ticketing page',
};

/**
 * "Start from a link" on an add form (#338): reads the page and fills the
 * form with what it says, for the person to check. The form keeps the link
 * (`source_url`) so the record remembers where it came from.
 */
const PrefillFromLink = ({ kind, onFields }) => {
  const fetcher = useFetcher();
  const [link, setLink] = useState('');
  const [used, setUsed] = useState(null);
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data?.fields) return;
    onFields(fetcher.data.fields);
    setUsed(fetcher.data);
    // Once per answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);
  const read = () => link.trim() && fetcher.load(`/sources/prefill?${new URLSearchParams({ kind, url: link.trim() })}`);
  return (
    <Field.Root gridColumn="1 / 3">
      <Field.Label htmlFor="prefill">Start from a link</Field.Label>
      <HStack width="100%">
        <Input
          id="prefill"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          onKeyDown={(event) => {
            // Not the whole form.
            if (event.key === 'Enter') {
              event.preventDefault();
              read();
            }
          }}
          placeholder="https://…"
          inputMode="url"
        />
        <Button type="button" variant="outline" onClick={read} loading={fetcher.state !== 'idle'}>
          <LuLink />
          Fill in
        </Button>
      </HStack>
      <Field.HelperText>{EXAMPLES[kind]}: what it says fills the form below, for you to check.</Field.HelperText>
      {used && <input type="hidden" name="source_url" value={used.url} />}
      {fetcher.data?.error && (
        <Alert.Root status="warning" mt={2}>
          <Alert.Indicator />
          <Alert.Title>{fetcher.data.error}</Alert.Title>
        </Alert.Root>
      )}
      {fetcher.data && !fetcher.data.error && !fetcher.data.fields && (
        <Text fontSize="sm" color="muted" mt={1}>
          That page says nothing we can use.
        </Text>
      )}
      {used?.fields && (
        <Text fontSize="sm" color="muted" mt={1} data-testid="prefilled">
          Filled in from {SOURCES[used.source]}. Check it before saving.
          {used.fields.place &&
            ` Place: ${[used.fields.place.name, used.fields.place.street, used.fields.place.city].filter(Boolean).join(', ')}. Choose it under Location.`}
        </Text>
      )}
    </Field.Root>
  );
};

export default PrefillFromLink;
