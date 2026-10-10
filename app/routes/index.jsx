import {
    Box,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Flex,
  Presence,
} from '@chakra-ui/react';
import { useColorModeValue } from '../components/ui/color-mode';
import { LuChevronRight } from 'react-icons/lu';

import { Link, useLoaderData } from 'react-router';

import isAuthenticated from '../utils/isAuthenticated.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import PlacesWidget from '../components/PlacesWidget';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { listNewEvents, listUpcomingEvents } from '../data/events.server';
import { listNewGames } from '../data/games.server';
import {
  listNewOrganizations,
  listOrganizationPoints,
} from '../data/organizations.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  const [
    games,
    associations,
    studios,
    events,
    eventsToCome,
    joinedEventsToCome,
    placesPoints,
  ] = await Promise.all([
    listNewGames({ limit: 6 }),
    listNewOrganizations({ type: 'association', limit: 6 }),
    listNewOrganizations({ type: 'studio', limit: 6 }),
    listNewEvents({ limit: 6 }),
    listUpcomingEvents({ limit: 3 }),
    currentUser
      ? listUpcomingEvents({ limit: 8, attendeeId: currentUser.id })
      : undefined,
    listOrganizationPoints(),
  ]);

  return {
    games,
    associations,
    studios,
    events,
    eventsToCome,
    placesCount: placesPoints.length,
    placesPoints,
    currentUser: currentUser
      ? { ...currentUser, eventsToCome: joinedEventsToCome }
      : null,
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie Collective - Community powered video game data',
    path: location.pathname,
  });

const HomePage = () => {
  const {
    games,
    studios,
    associations,
    eventsToCome,
    placesCount,
    placesPoints,
  } = useLoaderData();
  const bg = useColorModeValue('white', 'gray.900');

  // TODO: do something custom for logged in users
  // const { currentUser } = useLoaderData();

  return (
    <Box mb={5} pt={2} px={5}>
      <Box
        mb={5}
        px={2}
        pb={2}
        background={bg}
        shadow="sm"
        borderRadius={7}
        _hover={{ opacity: 1 }}
      >
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="lg" py={3} pl={2}>
            Games
          </Heading>
          <Button colorPalette="gray" variant="ghost" asChild>
            <Link to="/games">
              Explore games
              <LuChevronRight />
            </Link>
          </Button>
        </Flex>

        <Presence
          present
          animationName={{
            _open: 'fade-in',
            _closed: 'fade-out',
          }}
          animationDuration="moderate"
        >
          <Grid
            gap={2}
            templateColumns={[
              '2fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(3, 1fr)',
            ]}
          >
            {games.map((game) => (
              <Box key={game.id} minW={0}>
                <GameCard {...game} />
              </Box>
            ))}
          </Grid>
        </Presence>
      </Box>
      <PlacesWidget placesCount={placesCount} placesPoints={placesPoints} />
      <Grid gap={5} templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}>
        {/* minW 0: grid items otherwise can't shrink below their content,
            which pushed the page past a 375px screen. */}
        <Box
          minW={0}
          mb={5}
          px={2}
          pb={2}
          background={bg}
          shadow="sm"
          borderRadius={7}
          _hover={{ opacity: 1 }}
        >
          <Flex justify="space-between" align="center" wrap="wrap">
            <Heading as="h3" size="lg" py={3} pl={2}>
              Studios
            </Heading>
            <Button colorPalette="gray" variant="ghost" asChild>
              <Link to="/studios">
                Explore Studios
                <LuChevronRight />
              </Link>
            </Button>
          </Flex>

          <Presence
            present
            animationName={{
              _open: 'fade-in',
              _closed: 'fade-out',
            }}
            animationDuration="moderate"
          >
            <Grid
              mb={5}
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
              ]}
            >
              {studios.map((studios) => (
                <Box key={studios.id} minW={0}>
                  <OrgCard key={studios.id} {...studios} />
                </Box>
              ))}
            </Grid>
          </Presence>
        </Box>

        <Box
          minW={0}
          mb={5}
          px={2}
          pb={2}
          background={bg}
          shadow="sm"
          borderRadius={7}
          _hover={{ opacity: 1 }}
        >
          <Flex justify="space-between" align="center" wrap="wrap">
            <Heading as="h3" size="lg" py={3} pl={2}>
              Associations
            </Heading>
            <Button colorPalette="gray" variant="ghost" asChild>
              <Link to="/associations">
                Explore Associations
                <LuChevronRight />
              </Link>
            </Button>
          </Flex>

          <Presence
            present
            animationName={{
              _open: 'fade-in',
              _closed: 'fade-out',
            }}
            animationDuration="moderate"
          >
            <Grid
              mb={5}
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
              ]}
            >
              {associations.map((associations) => (
                <Box key={associations.id} minW={0}>
                  <OrgCard key={associations.id} {...associations} />
                </Box>
              ))}
            </Grid>
          </Presence>
        </Box>
      </Grid>
      <Box px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
        <Flex justify="space-between" align="center" mb={5}>
          <Heading as="h3" size="lg">
            Events
          </Heading>
          <Button colorPalette="gray" variant="ghost" asChild>
            <Link to="/events">
              Explore Events
              <LuChevronRight />
            </Link>
          </Button>
        </Flex>

        <Presence
          present
          animationName={{
            _open: 'fade-in',
            _closed: 'fade-out',
          }}
          animationDuration="moderate"
        >
          {eventsToCome.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(3, 1fr)',
              ]}
            >
              {eventsToCome.map((event) => (
                <Box key={event.id} minW={0}>
                  <EventCard {...event} />
                </Box>
              ))}
            </Grid>
          ) : (
            <Box mt={5} width={['auto', '50%', '35%', '25%']} mx="auto">
              <Image src={noEventsImage} alt="" />
              <Text fontSize="xl" mt={5} textAlign="center">
                No upcoming events
                <br />
                <small>(yet)</small>
              </Text>
            </Box>
          )}
        </Presence>
      </Box>
    </Box>
  );
};

export default HomePage;
