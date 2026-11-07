import { useEffect, useId, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import EventCard from './EventCard';
import Link from './Link';
import { PageSection } from './Page';
import { useLanguage, useT } from '../i18n';
import {
  agendaGroups,
  dayLabel,
  eventDays,
  eventOverlaps,
  lastDayOf,
  monthGrid,
  monthLabel,
  monthName,
  monthOf,
  shiftMonth,
  weekdayLabels,
} from '../utils/eventCalendar';
import { eventPath } from '../utils/slug';

// In person is the brand's deep green, online lilac, yours sun: told apart by
// lightness too, and canceled ones are struck through.
const TONES = {
  inPerson: { bg: 'brandDeep', color: 'canvas' },
  online: { bg: 'lilac', color: 'onPop' },
  going: { bg: 'sun', color: 'onPop' },
  canceled: {
    bg: 'transparent',
    color: 'muted',
    textDecoration: 'line-through',
    boxShadow: 'inset 0 0 0 1.5px var(--chakra-colors-rule)',
  },
};

const toneOf = (event, isGoing) =>
  event.status === 'canceled'
    ? 'canceled'
    : isGoing(event)
      ? 'going'
      : event.attendance === 'in_person'
        ? 'inPerson'
        : 'online';

const Bar = ({ bar, tone }) => (
  <Box
    asChild
    gridColumn={`${bar.column} / span ${bar.span}`}
    gridRow={bar.lane + 1}
    h={{ base: '6px', md: '26px' }}
    lineHeight="26px"
    fontSize={{ base: '0', md: 'xs' }}
    fontWeight="semibold"
    px={{ base: 0, md: 2 }}
    ml={bar.startsBefore ? 0 : { base: '2px', md: 1 }}
    mr={bar.endsAfter ? 0 : { base: '2px', md: 1 }}
    borderLeftRadius={bar.startsBefore ? 0 : 'md'}
    borderRightRadius={bar.endsAfter ? 0 : 'md'}
    whiteSpace="nowrap"
    overflow="hidden"
    textOverflow="ellipsis"
    // Too thin to aim for on a phone: the day's button takes the tap.
    pointerEvents={{ base: 'none', md: 'auto' }}
    _hover={{ outline: '2px solid', outlineColor: 'ink' }}
    {...TONES[tone]}
  >
    <Link to={eventPath(bar.event)} title={bar.event.name}>
      {bar.event.name}
    </Link>
  </Box>
);

const Day = ({ day, today, selected, onSelect, language, t }) => {
  const isToday = day.date === today;
  return (
    <Box
      as="button"
      type="button"
      aria-label={dayLabel(day.date, language)}
      aria-pressed={selected}
      aria-current={isToday ? 'date' : undefined}
      onClick={() => onSelect(selected ? null : day.date)}
      // Buttons centre what's in them: the number stays clear of the bars.
      display="flex"
      alignItems="flex-start"
      justifyContent="flex-start"
      textAlign="left"
      cursor="pointer"
      p={{ base: 1.5, md: 2 }}
      borderLeft="1px solid"
      borderColor="rule"
      _first={{ borderLeft: 0 }}
      bg={day.inMonth ? 'transparent' : 'canvas'}
      color={day.inMonth ? 'ink' : 'muted'}
      boxShadow={
        selected ? 'inset 0 0 0 2px var(--chakra-colors-brand)' : undefined
      }
      _hover={{ bg: 'canvas' }}
    >
      <HStack gap={1} align="center">
        <Text
          as="span"
          fontFamily="heading"
          fontWeight={day.inMonth ? 'bold' : 'semibold'}
          fontSize={{ base: 'sm', md: 'md' }}
          lineHeight="1"
          display="inline-grid"
          placeItems="center"
          minW="26px"
          h="26px"
          ml="-4px"
          borderRadius="full"
          bg={isToday ? 'coral' : undefined}
          color={isToday ? 'onPop' : undefined}
        >
          {Number(day.date.slice(8))}
        </Text>
        {day.more > 0 && (
          <Text as="span" fontSize="xs" color="muted" fontWeight="medium">
            {t('events.more', { count: day.more })}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

const Calendar = ({ month, events, today, selected, onSelect, isGoing }) => {
  const t = useT();
  const language = useLanguage();
  const weeks = monthGrid(month, events);
  return (
    <Box
      bg="surface"
      borderWidth="2px"
      borderColor="ink"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Grid
        templateColumns="repeat(7, minmax(0, 1fr))"
        borderBottom="2px solid"
        borderColor="ink"
        aria-hidden
      >
        {weekdayLabels(language).map((label) => (
          <Text
            key={label}
            px={{ base: 1, md: 2 }}
            py={2}
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="muted"
          >
            {label}
          </Text>
        ))}
      </Grid>
      {weeks.map((week) => (
        <Box
          key={week.start}
          position="relative"
          minH={{ base: '62px', md: '122px' }}
          borderBottom="1px solid"
          borderColor="rule"
          _last={{ borderBottom: 0 }}
        >
          <Grid
            position="absolute"
            inset={0}
            templateColumns="repeat(7, minmax(0, 1fr))"
          >
            {week.days.map((day) => (
              <Day
                key={day.date}
                day={day}
                today={today}
                selected={selected === day.date}
                onSelect={onSelect}
                language={language}
                t={t}
              />
            ))}
          </Grid>
          {/* Above the days, letting clicks through except on the bars. */}
          <Grid
            position="relative"
            pt={{ base: '36px', md: '40px' }}
            pb={{ base: 1, md: 2 }}
            templateColumns="repeat(7, minmax(0, 1fr))"
            gap="3px 0"
            pointerEvents="none"
          >
            {week.bars.map((bar) => (
              <Bar
                key={bar.event.id}
                bar={bar}
                tone={toneOf(bar.event, isGoing)}
              />
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

const KeyItem = ({ tone, children }) => (
  <HStack as="span" gap={2}>
    <Box w="22px" h="12px" borderRadius="sm" {...TONES[tone]} />
    {children}
  </HStack>
);

/**
 * The events page's diary (magazine pass): a month on the left, what's on on
 * the right. Picking a day starts the agenda there. A month's events always
 * show on the calendar; `upcoming` is what the agenda opens on this month.
 */
const EventDiary = ({
  month,
  initialToday,
  monthEvents,
  upcoming,
  currentUserId,
  empty,
}) => {
  const t = useT();
  const language = useLanguage();
  const headingId = useId();
  const [searchParams] = useSearchParams();
  const [today, setToday] = useState(initialToday);
  const [selected, setSelected] = useState(null);

  // The server's day comes first, the same on both sides for hydration.
  useEffect(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    setToday(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    );
  }, []);

  // A new month starts the agenda over.
  useEffect(() => setSelected(null), [month]);

  const monthHref = (target) => {
    const next = new URLSearchParams(searchParams);
    next.delete('period');
    if (target) next.set('month', target);
    else next.delete('month');
    const query = next.toString();
    return query ? `?${query}` : '/events';
  };

  const isGoing = (event) =>
    Boolean(currentUserId) &&
    event.event_participant?.some(
      ({ person_id: personId }) => personId === currentUserId
    );

  const isThisMonth = month === monthOf(today);
  const agenda = selected
    ? monthEvents.filter((event) => eventDays(event).last >= selected)
    : isThisMonth
      ? upcoming
      : monthEvents.filter((event) =>
          eventOverlaps(event, `${month}-01`, lastDayOf(month))
        );

  const agendaTitle = selected
    ? t('events.fromDay', { day: dayLabel(selected, language) })
    : isThisMonth
      ? t('lists.events.upcoming')
      : monthLabel(month, language);

  const groupLabel = (key) =>
    key === 'thisWeek'
      ? t('events.thisWeek')
      : key === 'nextWeek'
        ? t('events.nextWeek')
        : monthName(key, language);

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }}
      gap={{ base: 8, lg: 6 }}
      alignItems="start"
    >
      {/* The month stays in view beside a long agenda. */}
      <Box
        as="section"
        aria-labelledby={headingId}
        minW={0}
        position={{ lg: 'sticky' }}
        top={{ lg: 4 }}
      >
        <HStack gap={2} mb={4} wrap="wrap" justify="space-between">
          <Heading
            as="h2"
            id={headingId}
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="-0.03em"
            lineHeight="1"
          >
            {monthLabel(month, language)}
          </Heading>
          <HStack gap={2}>
            <IconButton
              asChild
              variant="popOutline"
              rounded="full"
              size="sm"
              aria-label={t('events.previousMonth')}
            >
              <Link
                to={monthHref(shiftMonth(month, -1))}
                preventScrollReset
                rel="nofollow"
              >
                <LuChevronLeft />
              </Link>
            </IconButton>
            <IconButton
              asChild
              variant="popOutline"
              rounded="full"
              size="sm"
              aria-label={t('events.nextMonth')}
            >
              <Link
                to={monthHref(shiftMonth(month, 1))}
                preventScrollReset
                rel="nofollow"
              >
                <LuChevronRight />
              </Link>
            </IconButton>
            {!isThisMonth && (
              <Button asChild variant="popOutline" rounded="full" size="sm">
                <Link to={monthHref(null)} preventScrollReset>
                  {t('events.today')}
                </Link>
              </Button>
            )}
          </HStack>
        </HStack>
        <Calendar
          month={month}
          events={monthEvents}
          today={today}
          selected={selected}
          onSelect={setSelected}
          isGoing={isGoing}
        />
        <HStack
          gap={4}
          rowGap={1}
          wrap="wrap"
          mt={3}
          fontSize="sm"
          color="muted"
        >
          <KeyItem tone="inPerson">{t('events.inPerson')}</KeyItem>
          <KeyItem tone="online">{t('events.onlineOrHybrid')}</KeyItem>
          {currentUserId && <KeyItem tone="going">{t('events.going')}</KeyItem>}
          <KeyItem tone="canceled">{t('events.canceled')}</KeyItem>
        </HStack>
      </Box>

      <PageSection
        title={agendaTitle}
        aside={
          selected && (
            <Button
              variant="plain"
              size="xs"
              onClick={() => setSelected(null)}
              textDecoration="underline"
            >
              {t('events.showAll')}
            </Button>
          )
        }
      >
        {agenda.length > 0 ? (
          <Stack gap={5}>
            {agendaGroups(agenda, today).map(({ key, events }) => (
              <Stack key={key} gap={3}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  color="brandDeep"
                  borderTop="2px solid"
                  borderColor="ink"
                  pt={2}
                >
                  {groupLabel(key)}
                </Text>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    variant="ticket"
                    going={isGoing(event)}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        ) : (
          empty
        )}
      </PageSection>
    </Grid>
  );
};

export default EventDiary;
