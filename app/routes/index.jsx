import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Flex,
  HStack,
  Input,
  Presence,
  Stack,
} from '@chakra-ui/react';
import { useColorModeValue } from '../components/ui/color-mode';
import { LuChevronRight, LuPlus, LuSearch } from 'react-icons/lu';

import { useId } from 'react';
import { Form, Link, useLoaderData } from 'react-router';

import isAuthenticated from '../utils/isAuthenticated.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import PlacesWidget from '../components/PlacesWidget';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { countEvents, listUpcomingEvents } from '../data/events.server';
import { countGames, listFeaturedGames } from '../data/games.server';
import {
  countOrganizations,
  listFeaturedOrganizations,
  listOrganizationPoints,
} from '../data/organizations.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  const [
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    placesPoints,
    gamesCount,
    orgsCount,
    eventsCount,
  ] = await Promise.all([
    // #199: complete entries, recently updated, rather than the newest.
    listFeaturedGames({ limit: 6 }),
    listFeaturedOrganizations({ type: 'association', limit: 6 }),
    listFeaturedOrganizations({ type: 'studio', limit: 6 }),
    listUpcomingEvents({ limit: 6 }),
    currentUser
      ? listUpcomingEvents({ limit: 3, attendeeId: currentUser.id })
      : [],
    listOrganizationPoints(),
    countGames(),
    countOrganizations(),
    countEvents(),
  ]);

  return {
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    placesCount: placesPoints.length,
    placesPoints,
    counts: { games: gamesCount, orgs: orgsCount, events: eventsCount },
    currentUser,
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie Collective - Community powered video game data',
    description:
      'The indie game scene, mapped by its community: studios, associations, games and events from around the world, in an open database anyone can add to.',
    path: location.pathname,
  });

const number = (n) => n.toLocaleString('en');

// #200: what the site is, search, and an invitation to add to it.
const Hero = ({ counts, signedIn }) => (
  <Box
    mb={5}
    px={[5, 8]}
    py={[6, 8]}
    borderRadius={7}
    bg={{ base: 'green.50', _dark: 'green.950' }}
  >
    <Heading as="h1" size={['2xl', '3xl']} mb={3}>
      The indie game scene, mapped by its community
    </Heading>
    <Text fontSize={['md', 'lg']} mb={2} maxW="2xl">
      Studios, associations, games and events from around the world, in an
      open database anyone can add to.
    </Text>
    <Text color="muted" mb={5}>
      {number(counts.games)} games · {number(counts.orgs)} studios and
      associations · {number(counts.events)} events
    </Text>

    <Form method="get" action="/search" role="search">
      <HStack maxW="xl" mb={5}>
        <Input
          name="q"
          size="lg"
          bg={{ base: 'white', _dark: 'gray.900' }}
          placeholder="Find a game, studio, association or event"
          aria-label="Search"
        />
        <Button type="submit" size="lg" colorPalette="green">
          <LuSearch />
          Search
        </Button>
      </HStack>
    </Form>

    <Stack direction={['column', 'row']} gap={2} align={['stretch', 'center']}>
      <Text fontWeight="semibold" mr={2}>
        Know one we're missing?
      </Text>
      {[
        ['/games/create', 'Add a game'],
        ['/orgs/create', 'Add a studio or association'],
        ['/events/create', 'Add an event'],
      ].map(([to, label]) => (
        <Button key={to} variant="outline" size="sm" asChild>
          <Link to={to}>
            <LuPlus />
            {label}
          </Link>
        </Button>
      ))}
    </Stack>
    {!signedIn && (
      <Text fontSize="sm" color="muted" mt={3}>
        Adding needs a free account: sign in with Bluesky.
      </Text>
    )}
  </Box>
);

// A homepage section: a heading, a link to the full list, and its cards.
const Section = ({ title, to, linkLabel, children, ...rest }) => {
  const bg = useColorModeValue('white', 'gray.900');
  // Labelled by its heading: a region screen readers can jump to.
  const headingId = useId();
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      minW={0}
      mb={5}
      px={2}
      pb={2}
      background={bg}
      shadow="sm"
      borderRadius={7}
      {...rest}
    >
      <Flex justify="space-between" align="center" wrap="wrap">
        <Heading as="h2" id={headingId} size="lg" py={3} pl={2}>
          {title}
        </Heading>
        <Button colorPalette="gray" variant="ghost" asChild>
          <Link to={to}>
            {linkLabel}
            <LuChevronRight />
          </Link>
        </Button>
      </Flex>
      <Presence
        present
        animationName={{ _open: 'fade-in', _closed: 'fade-out' }}
        animationDuration="moderate"
      >
        {children}
      </Presence>
    </Box>
  );
};

const cards = (columns) => ({
  gap: 3,
  templateColumns: columns,
});

const EventGrid = ({ events }) => (
  <Grid {...cards(['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)'])} mb={3}>
    {events.map((event) => (
      <Box key={event.id} minW={0}>
        <EventCard {...event} />
      </Box>
    ))}
  </Grid>
);

const HomePage = () => {
  const {
    games,
    studios,
    associations,
    eventsToCome,
    joinedEventsToCome,
    placesCount,
    placesPoints,
    counts,
    currentUser,
  } = useLoaderData();

  return (
    <Box mb={5} pt={2} px={5}>
      <Hero counts={counts} signedIn={!!currentUser} />

      {joinedEventsToCome.length > 0 && (
        <Section title="Your next events" to="/events" linkLabel="All events">
          <EventGrid events={joinedEventsToCome} />
        </Section>
      )}

      <Section title="Upcoming events" to="/events" linkLabel="Explore events">
        {eventsToCome.length > 0 ? (
          <EventGrid events={eventsToCome} />
        ) : (
          <Box my={5} width={['auto', '50%', '35%', '25%']} mx="auto">
            <Image src={noEventsImage} alt="" />
            <Text fontSize="xl" mt={5} textAlign="center">
              No upcoming events
              <br />
              <small>(yet)</small>
            </Text>
          </Box>
        )}
      </Section>

      <Section title="Games" to="/games" linkLabel="Explore games">
        <Grid
          {...cards(['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)'])}
          gap={2}
        >
          {games.map((game) => (
            <Box key={game.id} minW={0}>
              <GameCard {...game} />
            </Box>
          ))}
        </Grid>
      </Section>

      <PlacesWidget placesCount={placesCount} placesPoints={placesPoints} />

      {/* minW 0: grid items otherwise can't shrink below their content,
          which pushed the page past a 375px screen. */}
      <Grid gap={5} templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}>
        <Section title="Studios" to="/studios" linkLabel="Explore studios">
          <Grid {...cards(['1fr', 'repeat(2, 1fr)'])} mb={5}>
            {studios.map((studio) => (
              <Box key={studio.id} minW={0}>
                <OrgCard {...studio} />
              </Box>
            ))}
          </Grid>
        </Section>
        <Section
          title="Associations"
          to="/associations"
          linkLabel="Explore associations"
        >
          <Grid {...cards(['1fr', 'repeat(2, 1fr)'])} mb={5}>
            {associations.map((association) => (
              <Box key={association.id} minW={0}>
                <OrgCard {...association} />
              </Box>
            ))}
          </Grid>
        </Section>
      </Grid>
    </Box>
  );
};

export default HomePage;
