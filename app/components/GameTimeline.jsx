import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  IconButton,
  Input,
  Link as ChakraLink,
  NativeSelect,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { useFetcher } from 'react-router';

import EmptyHint from './EmptyHint';
import Link from './Link';
import { PageSection } from './Page';
import { formatEventRange } from '../utils/eventTime';
import {
  MAX_NOTE_LENGTH,
  MILESTONE_KINDS,
  buildTimeline,
  formatDuration,
  formatMilestoneDate,
  milestoneLabel,
  timeToRelease,
} from '../utils/gameTimeline';
import { eventPath } from '../utils/slug';
import { useLanguage } from '../i18n';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// When an entry happened, as precisely as it's known.
const EntryDate = ({ entry }) => {
  const language = useLanguage();
  return entry.type === 'event' ? (
    <time dateTime={new Date(entry.event.starts_at).toISOString()}>
      {formatEventRange(entry.event.starts_at, entry.event.ends_at, entry.event.time_zone, { time: false, locale: language })}
    </time>
  ) : (
    <time dateTime={entry.date.toISOString().slice(0, { year: 4, month: 7 }[entry.precision] ?? 10)}>
      {formatMilestoneDate(entry.date, entry.precision)}
    </time>
  );
};

// What happened: the milestone, the event (linked) or the release.
const EntryTitle = ({ entry }) => {
  if (entry.type === 'event') {
    return (
      <ChakraLink asChild fontWeight="semibold">
        <Link to={eventPath(entry.event)}>{entry.event.name}</Link>
      </ChakraLink>
    );
  }
  return <Text fontWeight="semibold">{entry.type === 'release' ? 'Released' : milestoneLabel(entry.kind)}</Text>;
};

/**
 * A milestone's fields: what, when (year, month, day), and a note. Also on
 * missions (#378), in their own form.
 */
export const MilestoneFields = ({ children }) => {
  const thisYear = new Date().getUTCFullYear();
  return (
    <Flex gap={2} wrap="wrap" align="flex-end">
      <Field.Root width="auto">
        <Field.Label fontSize="sm">Step</Field.Label>
        <NativeSelect.Root size="sm" width="12rem">
          <NativeSelect.Field name="kind" defaultValue="announced">
            {MILESTONE_KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      <Field.Root width="6rem" required>
        <Field.Label fontSize="sm">Year</Field.Label>
        <Input size="sm" name="year" type="number" min={1970} max={thisYear + 10} required />
      </Field.Root>
      <Field.Root width="auto">
        <Field.Label fontSize="sm">Month</Field.Label>
        <NativeSelect.Root size="sm" width="6rem">
          <NativeSelect.Field name="month" defaultValue="">
            <option value="">—</option>
            {MONTHS.map((month, i) => (
              <option key={month} value={i + 1}>
                {month}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      <Field.Root width="5rem">
        <Field.Label fontSize="sm">Day</Field.Label>
        <Input size="sm" name="day" type="number" min={1} max={31} />
      </Field.Root>
      <Field.Root flex="1" minW="12rem">
        <Field.Label fontSize="sm">Note</Field.Label>
        <Input size="sm" name="note" maxLength={MAX_NOTE_LENGTH} placeholder="On Switch, with Raw Fury…" />
      </Field.Root>
      {children}
    </Flex>
  );
};

/** The form members add a milestone with. */
const AddMilestone = ({ gameId }) => {
  const fetcher = useFetcher();
  const form = useRef(null);
  // Empty again once added: the page reloads its data after the save.
  useEffect(() => {
    if (fetcher.state === 'loading') form.current?.reset();
  }, [fetcher.state]);
  return (
    <fetcher.Form ref={form} method="post" action={`/game/${gameId}/milestones/add`}>
      <Box mt={4}>
        <MilestoneFields>
          <Button type="submit" size="sm" colorPalette="green" loading={fetcher.state !== 'idle'}>
            <LuPlus />
            Add to timeline
          </Button>
        </MilestoneFields>
      </Box>
    </fetcher.Form>
  );
};

/**
 * A game's timeline (#332): its milestones, the events it went to and its
 * release date from IGDB, oldest first, with how long after the first step
 * each came. Members add and remove milestones.
 */
const GameTimeline = ({ gameId, milestones, events, igdbReleaseDate, currentUser }) => {
  const fetcher = useFetcher();
  const entries = buildTimeline({ milestones, events, igdbReleaseDate });
  if (entries.length === 0 && !currentUser) return null;
  const toRelease = timeToRelease(entries);

  return (
    <PageSection
      title="Timeline"
      aside={
        toRelease && (
          <Text color="muted" fontSize="sm">
            {toRelease} to release
          </Text>
        )
      }
    >
      {entries.length === 0 && (
        <EmptyHint>How did this game come to be? Add when it was announced, in beta, released…</EmptyHint>
      )}
      <Box as="ol" listStyleType="none" m={0} p={0}>
        {entries.map((entry, index) => (
          <Box
            as="li"
            key={`${entry.type}-${entry.id}`}
            position="relative"
            pl={6}
            pb={index === entries.length - 1 ? 0 : 5}
            // The line between steps, and a dot on it for each.
            borderLeft="2px solid"
            borderColor={index === entries.length - 1 ? 'transparent' : 'border'}
            ml={1}
            _before={{
              content: '""',
              position: 'absolute',
              left: '-7px',
              top: '6px',
              boxSize: '12px',
              borderRadius: 'full',
              bg: entry.type === 'event' ? 'purple.500' : 'green.500',
            }}
          >
            <Flex gap={2} align="baseline" wrap="wrap">
              <Text fontSize="sm" color="muted">
                <EntryDate entry={entry} />
              </Text>
              {entry.since > 0 && (
                <Badge size="sm" variant="subtle">
                  +{formatDuration(entry.since)}
                </Badge>
              )}
              {entry.type === 'release' && (
                <Badge size="sm" variant="outline">
                  from IGDB
                </Badge>
              )}
            </Flex>
            <Flex gap={2} align="center">
              <EntryTitle entry={entry} />
              {currentUser && entry.type === 'milestone' && (
                <IconButton
                  size="2xs"
                  variant="ghost"
                  colorPalette="red"
                  aria-label={`Remove ${milestoneLabel(entry.kind)} from the timeline`}
                  onClick={() =>
                    fetcher.submit(
                      { id: entry.id },
                      { method: 'post', action: `/game/${gameId}/milestones/delete` }
                    )
                  }
                >
                  <LuTrash2 />
                </IconButton>
              )}
            </Flex>
            {entry.note && (
              <Text fontSize="sm" color="muted">
                {entry.note}
              </Text>
            )}
          </Box>
        ))}
      </Box>
      {currentUser && <AddMilestone gameId={gameId} />}
    </PageSection>
  );
};

export default GameTimeline;
