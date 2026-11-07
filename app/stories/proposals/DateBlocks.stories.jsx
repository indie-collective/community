import { AspectRatio, Box, Flex, Image, Text } from '@chakra-ui/react';

import DateLabel from '../../components/DateLabel';
import EventCard from '../../components/EventCard';
import { formatEventDay } from '../../utils/eventTime';
import { events } from '../fixtures';
import { Board, Row } from './shared';
import { Body, STUB, Stub, Ticket, stubNotches } from './ticket';
import cover from './sample-cover.svg';

export default {
  title: 'Proposals/4 Date blocks',
  parameters: { layout: 'fullscreen' },
};

const [jam] = events;

const OnCover = ({ children }) => (
  <Box position="relative" w="420px">
    <AspectRatio ratio={2}>
      <Image src={cover} alt="" objectFit="cover" rounded="xl" />
    </AspectRatio>
    {children}
  </Box>
);

export const Today = {
  render: () => (
    <Board title="Date blocks today">
      <Row label="DateLabel" where="Event page, over its picture: red month bar, grey see-through body">
        <OnCover>
          <DateLabel value={jam.starts_at} timeZone={jam.time_zone} position="absolute" right={3} bottom={3} />
        </OnCover>
      </Row>
      <Row label="Ticket stub" where="Every ticket">
        <Box w="320px">
          <EventCard {...jam} variant="ticket" />
        </Box>
      </Row>
    </Board>
  ),
};

// The ticket's stub, on its own: the same day and month, the same type.
const DateStub = ({ value, timeZone, ...rest }) => {
  const day = formatEventDay(value, timeZone, { locale: 'en' });
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="74px"
      py={3}
      bg="surface"
      rounded="xl"
      shadow="lift"
      {...rest}
    >
      <Text fontFamily="heading" fontWeight="600" fontSize="3xl" lineHeight="1">
        {day?.day}
      </Text>
      <Text fontSize="xs" fontWeight="semibold" color="brandDeep">
        {day?.month}
      </Text>
    </Flex>
  );
};

export const Proposed = {
  render: () => (
    <Board title="Date blocks, proposed: one DateStub">
      <Row label="DateStub on a picture" where="Event page: the ticket's stub, on its own">
        <OnCover>
          <DateStub value={jam.starts_at} timeZone={jam.time_zone} position="absolute" right={3} bottom={3} />
        </OnCover>
      </Row>
      <Row label="The same stub in a ticket" where="Tickets use DateStub for their stub">
        <Box w="320px">
          <EventCard {...jam} variant="ticket" />
        </Box>
      </Row>
    </Board>
  ),
};

// The calendar page: a coloured bar with the month, the day on white.
const CalendarTile = ({ value, timeZone, bar, barColor, size = 'lg', ...rest }) => {
  const day = formatEventDay(value, timeZone, { locale: 'en' });
  const big = size === 'lg';
  return (
    <Box
      w={big ? '84px' : '52px'}
      textAlign="center"
      bg="surface"
      rounded={big ? 'xl' : 'md'}
      overflow="hidden"
      shadow="lift"
      {...rest}
    >
      <Text bg={bar} color={barColor} fontWeight="semibold" fontSize={big ? 'sm' : '2xs'} py={big ? 1 : 0.5}>
        {day?.month}
      </Text>
      <Text fontFamily="heading" fontWeight="600" fontSize={big ? '4xl' : 'xl'} lineHeight="1" py={big ? 2 : 1.5}>
        {day?.day}
      </Text>
    </Box>
  );
};

const BARS = [
  ['Red, white month', '4.6:1. The original red, a little deeper so the month reads', '#d63c2f', 'white'],
  ['Coral, ink month', '6:1. The site’s coral, which today marks today and canceled', 'coral', 'onPop'],
  ['Green, white month', '5:1. The primary button’s green', '#0f7d6d', 'white'],
];

export const CalendarTiles = {
  render: () => (
    <Board title="Date blocks: the calendar tile, three bars">
      {BARS.map(([label, where, bar, color]) => (
        <Row key={label} label={label} where={where}>
          <OnCover>
            <CalendarTile value={jam.starts_at} timeZone={jam.time_zone} bar={bar} barColor={color} position="absolute" right={3} bottom={3} />
          </OnCover>
          <Box w="300px">
            <Flex bg="surface" rounded="xl" shadow="lift" align="center" gap={4} p={3}>
              <CalendarTile value={jam.starts_at} timeZone={jam.time_zone} bar={bar} barColor={color} size="sm" shadow="none" borderWidth="1px" borderColor="rule" />
              <Box minW={0}>
                <Text fontWeight="semibold" fontSize="lg" lineHeight="1.2">
                  {jam.name}
                </Text>
                <Text fontSize="sm" color="muted">
                  Nov 13 – Nov 15 · Nantes
                </Text>
              </Box>
            </Flex>
            <Text fontSize="xs" color="muted" mt={2}>
              The same tile as a ticket's stub, if tickets take it too
            </Text>
          </Box>
        </Row>
      ))}
    </Board>
  ),
};

// The validated ticket, its stub as the calendar tile and nothing else
// changed.
const CalendarStub = ({ event }) => {
  const day = formatEventDay(event.starts_at, event.time_zone, { locale: 'en' });
  return (
    <Flex direction="column" align="stretch" textAlign="center">
      <Text bg="#0f7d6d" color="white" fontWeight="semibold" fontSize="xs" py={0.5}>
        {day?.month}
      </Text>
      <Flex flex="1" align="center" justify="center" py={2}>
        <Text fontFamily="heading" fontWeight="600" fontSize="3xl" lineHeight="1">
          {day?.day}
        </Text>
      </Flex>
    </Flex>
  );
};

export const TicketWithCalendarStub = {
  render: () => (
    <Board title="The ticket with the calendar stub">
      <Row label="Ticket, as validated" where="Day and month in the stub">
        <Box w="340px">
          <Ticket notchAt={stubNotches} columns={`${STUB}px 1fr`}>
            <Stub event={jam} />
            <Body event={jam} />
          </Ticket>
        </Box>
      </Row>
      <Row label="Ticket, calendar stub" where="The stub takes the event page's green month bar">
        <Box w="340px">
          <Ticket notchAt={stubNotches} columns={`${STUB}px 1fr`}>
            <CalendarStub event={jam} />
            <Body event={jam} />
          </Ticket>
        </Box>
      </Row>
    </Board>
  ),
};
