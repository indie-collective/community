import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Combobox,
  HStack,
  Image,
  Portal,
  Text,
  useListCollection,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { Form, useFetcher, useLocation, useNavigate } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';

const KIND_LABELS = {
  game: 'Game',
  studio: 'Studio',
  association: 'Association',
  event: 'Event',
};

// The last item: every result, on the search page.
const allResults = (q) => ({
  kind: 'all',
  id: 'all',
  name: q,
  href: `/search?${new URLSearchParams({ q })}`,
});

/**
 * The header's search box (#306): suggests the best matches as people type,
 * and Enter (or the last suggestion) shows every result on /search.
 * Typing no longer navigates, so the back button goes where it should.
 */
const SearchInput = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const suggestions = useFetcher();
  const inputRef = useRef();
  const [highlighted, setHighlighted] = useState(null);
  const [open, setOpen] = useState(false);

  // On /search, the box shows the query.
  const pageQuery =
    pathname === '/search' ? (new URLSearchParams(search).get('q') ?? '') : '';
  const [inputValue, setInputValue] = useState(pageQuery);
  useEffect(() => setInputValue(pageQuery), [pageQuery]);
  // A new page closes the suggestions.
  useEffect(() => setOpen(false), [pathname, search]);

  const { collection, set } = useListCollection({
    initialItems: [],
    itemToValue: (item) => item.href,
    itemToString: (item) => item.name,
  });

  const load = useDebouncedCallback((q) => {
    if (q.trim().length >= 2) {
      suggestions.load(`/search-suggest?${new URLSearchParams({ q })}`);
    }
  }, 200);

  const q = inputValue.trim();
  // Suggestions arrive after typing: open the list then, if the box still
  // has focus (the combobox only opens itself on input).
  useEffect(() => {
    const data = suggestions.data;
    if (q.length < 2) {
      set([]);
      setOpen(false);
    } else if (data?.q?.trim() === q) {
      set([...data.suggestions, allResults(q)]);
      if (document.activeElement === inputRef.current) setOpen(true);
    }
    // `set` changes every render; the items depend on these only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions.data, q]);

  return (
    <Box flex="1" width="100%">
      <Form
        action="/search"
        method="get"
        role="search"
        onSubmit={(event) => {
          if (!q) event.preventDefault();
        }}
      >
        <Combobox.Root
          collection={collection}
          inputValue={inputValue}
          onInputValueChange={({ inputValue: value, reason }) => {
            setInputValue(value);
            if (reason === 'input-change') load(value);
          }}
          onHighlightChange={({ highlightedValue }) =>
            setHighlighted(highlightedValue)
          }
          onValueChange={({ items: [item] }) => {
            if (item) navigate(item.href, { viewTransition: true });
          }}
          // A chosen suggestion leaves the box as it was typed.
          selectionBehavior="preserve"
          open={open}
          onOpenChange={({ open: next }) => setOpen(next && q.length >= 2)}
          positioning={{ sameWidth: false, placement: 'bottom-start' }}
          size="lg"
          width="100%"
        >
          <Combobox.Label srOnly>Search</Combobox.Label>
          <Combobox.Control>
            <Box
              position="absolute"
              insetStart={3}
              top="50%"
              transform="translateY(-50%)"
              color="brand"
              pointerEvents="none"
              zIndex={1}
            >
              <LuSearch />
            </Box>
            <Combobox.Input
              ref={inputRef}
              name="q"
              placeholder="Search"
              ps={10}
              bg="surface"
              borderWidth="2px"
              borderColor="ink"
              borderRadius="full"
              _focusVisible={{
                outline: 'none',
                borderColor: 'ink',
                shadow: 'pop',
              }}
              onKeyDown={(event) => {
                // Enter without a suggestion picked: every result.
                if (event.key === 'Enter' && !highlighted) {
                  event.preventDefault();
                  setOpen(false);
                  if (q) navigate(allResults(q).href, { viewTransition: true });
                }
              }}
            />
            <Combobox.IndicatorGroup>
              <Combobox.ClearTrigger aria-label="Clear search" />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content
                minW={['calc(100vw - 32px)', '360px']}
                maxW="480px"
              >
                {collection.items.map((item) =>
                  item.kind === 'all' ? (
                    <Combobox.Item
                      item={item}
                      key="all"
                      fontWeight="semibold"
                      justifyContent="flex-start"
                    >
                      <LuSearch />
                      See all results for “{item.name}”
                    </Combobox.Item>
                  ) : (
                    <Combobox.Item item={item} key={item.href} gap={3}>
                      <HStack gap={3} minW={0} flex="1">
                        <Box
                          flexShrink={0}
                          boxSize={8}
                          borderRadius="md"
                          overflow="hidden"
                          bg={{ base: 'gray.100', _dark: 'gray.700' }}
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt=""
                              boxSize={8}
                              objectFit="cover"
                              // A missing thumbnail leaves the grey square.
                              onError={(event) => {
                                event.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                          )}
                        </Box>
                        <Text truncate flex="1">
                          {item.name}
                        </Text>
                        <Text fontSize="xs" color="muted" flexShrink={0}>
                          {KIND_LABELS[item.kind]}
                        </Text>
                      </HStack>
                    </Combobox.Item>
                  )
                )}
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.Root>
      </Form>
    </Box>
  );
};

export default SearchInput;
