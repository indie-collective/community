import { useEffect, useId, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Combobox,
  Flex,
  HStack,
  IconButton,
  Popover,
  Portal,
  Text,
  createListCollection,
} from '@chakra-ui/react';
import { LuGamepad2, LuPlus } from 'react-icons/lu';
import { useFetcher } from 'react-router';

import AtlasMark from './AtlasMark';
import useDebounce from '../hooks/useDebounce';
import { formatEventDate } from '../utils/eventTime';
import { orgTypeLabel } from '../utils/orgTypes';

// What a row says about a record: its mark, and a line of what and where.
export const describeOrganization = (org) => ({
  icon: <AtlasMark type={org.type} size={14} />,
  meta: [orgTypeLabel(org.type), org.city].filter(Boolean).join(' · '),
});

export const describeGame = () => ({ icon: <LuGamepad2 size={14} />, meta: 'Game' });

export const describeEvent = (event) => ({
  icon: <AtlasMark type="event" size={14} />,
  meta: [
    'Event',
    // "Nov 14, 2025" when it's not this year, as dates are everywhere.
    event.starts_at &&
      formatEventDate(event.starts_at, event.time_zone, { time: false, locale: 'en' }),
  ]
    .filter(Boolean)
    .join(' · '),
});

// "Add “Pixel” as a studio" and "… as an association".
export const ORGANIZATION_CREATE = [
  { type: 'studio', label: (name) => `Add “${name}” as a studio` },
  { type: 'association', label: (name) => `Add “${name}” as an association` },
];

const NONE = [];

const sameName = (a, b) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/** A record as a row: its mark in a small tile, its name, what and where. */
export const RecordRow = ({ record, describe }) => {
  const { icon, meta } = describe(record);
  return (
    <HStack gap={3} minW={0}>
      <Flex
        flexShrink={0}
        w="28px"
        h="28px"
        rounded="label"
        bg="canvas"
        align="center"
        justify="center"
        borderWidth="1px"
        borderColor="rule"
        color="muted"
      >
        {icon}
      </Flex>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
          {record.name}
        </Text>
        {meta && (
          <Text fontSize="xs" color="muted" lineClamp={1}>
            {meta}
          </Text>
        )}
      </Box>
    </HStack>
  );
};

/**
 * Finding a record by name, wherever one is linked or chosen: a field that
 * searches `source` (/search-org, /search-game, /search-event) as you type;
 * the results as rows, the first highlighted, arrows to move and Enter to
 * pick; and, under a rule, the ways to add what isn't there yet
 * (`createOptions` with `onCreate`). With `value`, the pick shows as a row
 * with Change.
 */
const RecordPicker = ({
  source,
  label,
  hideLabel = false,
  placeholder = 'Search by name',
  excludedIds = [],
  describe = describeOrganization,
  createOptions = NONE,
  onSelect,
  onCreate,
  value,
  onClear,
  inputId,
}) => {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);
  const search = useFetcher();
  const notId = excludedIds.join(',');

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) return;
    const params = new URLSearchParams({ q });
    if (notId) params.set('notId', notId);
    search.load(`${source}?${params}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search is stable
  }, [debounced, source, notId]);

  const name = query.trim();
  const answered =
    name.length >= 2 && search.state === 'idle' && Array.isArray(search.data);
  const records = useMemo(() => (answered ? search.data : []), [answered, search.data]);
  const items = useMemo(() => {
    const found = records.map((record) => ({
      value: record.id,
      label: record.name,
      record,
    }));
    const creating =
      onCreate && name.length >= 3 && answered && !records.some((r) => sameName(r.name, name))
        ? createOptions.map(({ type, label: say }) => ({
            value: `new:${type ?? ''}`,
            label: say(name),
            create: type ? { name, type } : { name },
          }))
        : [];
    return [...found, ...creating];
  }, [records, answered, name, onCreate, createOptions]);

  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      }),
    [items]
  );

  if (value) {
    return (
      <Box>
        {!hideLabel && (
          <Text fontWeight="semibold" fontSize="sm" mb={1.5}>
            {label}
          </Text>
        )}
        <HStack
          justify="space-between"
          gap={3}
          p={2}
          pe={3}
          bg="surface"
          borderWidth="1px"
          borderColor="rule"
          rounded="card"
        >
          <RecordRow record={value} describe={describe} />
          <Button variant="plain" size="sm" textDecoration="underline" onClick={onClear}>
            Change
          </Button>
        </HStack>
      </Box>
    );
  }

  const firstCreate = items.findIndex((item) => item.create);
  return (
    <Combobox.Root
      collection={collection}
      // Uncontrolled: controlling the text while the list updates drops
      // keystrokes. The query only mirrors it.
      onInputValueChange={(details) => setQuery(details.inputValue)}
      onValueChange={(details) => {
        const item = details.items[0];
        if (!item) return;
        setQuery('');
        if (item.create) onCreate?.(item.create);
        else onSelect?.(item.record);
      }}
      inputBehavior="autohighlight"
      selectionBehavior="clear"
      positioning={{ sameWidth: true, gutter: 4 }}
      ids={inputId ? { input: inputId } : undefined}
      width="100%"
    >
      <Combobox.Label srOnly={hideLabel} fontWeight="semibold">
        {label}
      </Combobox.Label>
      {/* Enter picks; it never submits the form around the picker. Caught
          here, as it bubbles, so the combobox has picked first. */}
      <Combobox.Control onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}>
        <Combobox.Input
          placeholder={placeholder}
          borderRadius="control"
          borderWidth="2px"
          borderColor="brand"
        />
      </Combobox.Control>
      {/* Not portalled: inside a popover, a portalled list would count as a
          click outside it. */}
      <Combobox.Positioner>
        <Combobox.Content
          p={1}
          bg="surface"
          borderWidth="1px"
          borderColor="rule"
          rounded="card"
          shadow="lift"
        >
          <Combobox.Empty px={3} py={2} fontSize="sm" color="muted">
            {answered ? 'Nothing found' : 'Searching'}
          </Combobox.Empty>
          {collection.items.map((item, index) => (
            <Box key={item.value}>
              {index === firstCreate && index > 0 && (
                <Box borderTopWidth="1px" borderColor="rule" my={1} />
              )}
              <Combobox.Item
                item={item}
                px={3}
                py={2}
                rounded="control"
                _highlighted={{ bg: 'canvas' }}
              >
                {item.create ? (
                  <HStack gap={2} fontSize="sm" fontWeight="semibold">
                    <LuPlus />
                    <Text>{item.label}</Text>
                  </HStack>
                ) : (
                  <RecordRow record={item.record} describe={describe} />
                )}
              </Combobox.Item>
            </Box>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};

/**
 * Linking a record from a record's page: a + button that opens the picker in
 * a popover under it. Picking or adding closes it.
 */
export const LinkPicker = ({ label, onSelect, onCreate, triggerProps, ...picker }) => {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  return (
    <Popover.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      // Focus moves to the field once the popover is open: focused any
      // earlier, the combobox doesn't know it and ignores the typing.
      initialFocusEl={() => document.getElementById(inputId)}
      positioning={{ placement: 'bottom-start' }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>
        <IconButton variant="outline" aria-label={label} {...triggerProps}>
          <LuPlus />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="min(380px, calc(100vw - 32px))" rounded="card" p={3}>
            <RecordPicker
              {...picker}
              label={label}
              hideLabel
              inputId={inputId}
              onSelect={(record) => {
                setOpen(false);
                onSelect?.(record);
              }}
              onCreate={
                onCreate &&
                ((record) => {
                  setOpen(false);
                  onCreate(record);
                })
              }
            />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default RecordPicker;
