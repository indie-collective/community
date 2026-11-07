import { Box, Flex, Grid, Image, Text } from '@chakra-ui/react';

import Card from '../../components/Card';
import CardLink from '../../components/CardLink';
import EventCard from '../../components/EventCard';
import EventMapCard from '../../components/EventMapCard';
import RelatedEvents from '../../components/RelatedEvents';
import { formatEventDay } from '../../utils/eventTime';
import { events } from '../fixtures';
import cover from './sample-cover.svg';
import { Board, Row } from './shared';
import { Body, STUB, Stub, Ticket, stubNotches } from './ticket';

export default {
  title: 'Proposals/3 Event cards',
  parameters: { layout: 'fullscreen' },
};

const [jam, showcase, meetup] = events;

export const Today = {
  render: () => (
    <Board title="Event cards today">
      <Row label="EventCard" where="Events page “Recently”, venue, organisation, country, person, related events">
        <Box w="260px">
          <EventCard {...jam} />
        </Box>
      </Row>
      <Row label="EventCard ticket" where="Homepage, events diary">
        <Box w="300px">
          <EventCard {...showcase} variant="ticket" going />
        </Box>
      </Row>
      <Row label="EventMapCard" where="Atlas list, grey hover">
        <Box w="300px">
          <EventMapCard {...jam} />
        </Box>
      </Row>
      <Row label="Three grids" where="RelatedEvents (gap 5), the events and person pages' own EventGrid (gap 4), the homepage's TicketGrid">
        <Box w="920px">
          <RelatedEvents events={[jam, showcase, meetup]} />
        </Box>
      </Row>
    </Board>
  ),
};

// The atlas's ticket: the same stub, smaller, flat on its list.
const CompactTicket = ({ id, slug, name, starts_at, time_zone, location }) => {
  const day = formatEventDay(starts_at, time_zone, { locale: 'en' });
  return (
    <Card
      isClickable
      display="grid"
      gridTemplateColumns="52px 1fr"
      alignItems="center"
      bg="surface"
      rounded="lg"
      borderWidth="1px"
      borderColor="rule"
      _hover={{ borderColor: 'ink' }}
    >
      <Flex direction="column" align="center" py={2} borderRight="2px dashed" borderColor="rule">
        <Text fontFamily="heading" fontWeight="600" fontSize="xl" lineHeight="1">
          {day?.day}
        </Text>
        <Text fontSize="xs" fontWeight="semibold" color="brandDeep">
          {day?.month}
        </Text>
      </Flex>
      <Box px={3} minW={0}>
        <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
          <CardLink to={`/event/${slug ?? id}`}>{name}</CardLink>
        </Text>
        <Text fontSize="xs" color="muted" lineClamp={1}>
          {location?.city ?? 'Online'}
        </Text>
      </Box>
    </Card>
  );
};

const EventGrid = ({ events: list }) => (
  <Grid gap={4} templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} pt={2}>
    {list.map((event) => (
      <Box key={event.id} minW={0}>
        <EventCard {...event} variant="ticket" />
      </Box>
    ))}
  </Grid>
);

export const Proposed = {
  render: () => (
    <Board title="Event cards, proposed: the ticket everywhere">
      <Row label="Ticket" where="Every list of events: homepage, diary, Recently, venue, organisation, country, person, related">
        <Box w="300px">
          <EventCard {...showcase} variant="ticket" going />
        </Box>
      </Row>
      <Row label="Compact ticket" where="The atlas's list, replacing EventMapCard">
        <Box w="300px">
          <CompactTicket {...jam} />
        </Box>
      </Row>
      <Row label="One EventGrid" where="1, 2, then 3 columns, gap 4, everywhere">
        <Box w="920px">
          <EventGrid events={[jam, showcase, meetup]} />
        </Box>
      </Row>
      <Row label="Removed" where="The picture card: an event's picture shows on its own page">
        <Text fontSize="sm" color="muted">
          EventCard's default look, EventMapCard, RelatedEvents and the two page-level grids
        </Text>
      </Row>
    </Board>
  ),
};

// The plain ticket, its holes cut out.
const PlainTicket = (event) => (
  <Ticket notchAt={stubNotches} columns={`${STUB}px 1fr`}>
    <Stub event={event} />
    <Body event={event} />
  </Ticket>
);

// A: the picture is the stub, square, edge to edge. The date is in the line
// under the name.
const PictureStub = (event) => (
  <Ticket notchAt={stubNotches} columns={`${STUB}px 1fr`}>
    <Image src={cover} alt="" w="100%" h="100%" minH={`${STUB}px`} objectFit="cover" />
    <Body event={event} />
  </Ticket>
);

// B: a picture strip on top, torn off along a perforation, the stub below.
const STRIP = 124;
const PictureTicket = (event) => (
  <Ticket notchAt={[`0 ${STRIP}px`, `100% ${STRIP}px`]}>
    <Image src={cover} alt="" w="100%" h={`${STRIP}px`} objectFit="cover" />
    <Grid templateColumns={`${STUB}px 1fr`} borderTop="2px dashed" borderColor="rule">
      <Stub event={event} />
      <Body event={event} />
    </Grid>
  </Ticket>
);

export const WithPictures = {
  render: () => (
    <Board title="Event tickets with their picture">
      <Row label="A. Picture stub" where="Lists: a square picture filling the stub, the date in the line under the name">
        <Box w="340px">
          <PictureStub {...jam} />
        </Box>
        <Box w="340px">
          <PlainTicket {...showcase} />
        </Box>
      </Row>
      <Row label="B. Picture ticket" where="Grids: a strip of the picture on top, torn along a perforation">
        <Box w="300px">
          <PictureTicket {...jam} />
        </Box>
        <Box w="300px">
          <PictureTicket {...showcase} />
        </Box>
      </Row>
      <Row label="Without a picture" where="A falls back to the plain stub, B to the plain ticket">
        <Box w="340px">
          <PlainTicket {...meetup} />
        </Box>
      </Row>
      <Row label="Holes, before and after" where="Before: circles painted in the page colour show over the shadow. After: cut out, the shadow follows">
        <Box w="340px">
          <EventCard {...meetup} variant="ticket" />
        </Box>
        <Box w="340px">
          <PlainTicket {...meetup} />
        </Box>
      </Row>
    </Board>
  ),
};
