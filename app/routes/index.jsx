import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Fade,
  useColorModeValue,
  Button,
  Flex,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeEvent from '../models/event';
import computeGame from '../models/game';
import computeOrg from '../models/org';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import AuthenticatedHomePage from '../components/AuthenticatedHomePage';
import PlacesWidget from '../components/PlacesWidget';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request);

  const games = await db.game.findMany({
    include: {
      game_image: {
        include: {
          image: true,
        },
      },
      game_entity: {
        include: {
          entity: true,
        },
      },
      game_tag: { include: { tag: true } },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 6,
  });

  const associations = await db.entity.findMany({
    where: {
      type: 'association',
    },
    include: {
      location: true,
      logo: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 6,
  });

  const studios = await db.entity.findMany({
    where: {
      type: 'studio',
    },
    include: {
      location: true,
      logo: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 6,
  });

  const events = await db.event.findMany({
    include: {
      event_participant: true,
      game_event: {
        where: {
          game: {
            deleted: false,
          },
        },
      },
      location: true,
      cover: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 6,
  });

  const eventsToCome = await db.event.findMany({
    where: {
      status: {
        not: 'canceled',
      },
      ends_at: {
        gte: new Date(),
      },
    },
    include: {
      event_participant: true,
      game_event: {
        where: {
          game: {
            deleted: false,
          },
        },
      },
      location: true,
      cover: true,
    },
    orderBy: {
      starts_at: 'asc',
    },
    take: 3,
  });

  const joinedEventsToCome = currentUser
    ? await db.event.findMany({
        where: {
          event_participant: {
            some: {
              person_id: currentUser.id,
            },
          },
          status: {
            not: 'canceled',
          },
          ends_at: {
            gte: new Date(),
          },
        },
        include: {
          event_participant: true,
          game_event: {
            where: {
              game: {
                deleted: false,
              },
            },
          },
          location: true,
          cover: true,
        },
        orderBy: {
          starts_at: 'asc',
        },
        take: 8,
      })
    : undefined;

  const placesCount = await db.entity.count({
    where: {
      location: {
        isNot: null,
      },
    },
  });

  const placesPoints = await db.entity.findMany({
    where: {
      location: {
        isNot: null,
      },
    },
    select: {
      location: {
        select: {
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  const data = {
    games: await Promise.all(games.map(computeGame)),
    associations: await Promise.all(associations.map(computeOrg)),
    studios: await Promise.all(studios.map(computeOrg)),
    events: await Promise.all(events.map(computeEvent)),
    eventsToCome: await Promise.all(eventsToCome.map(computeEvent)),
    placesCount,
    placesPoints: placesPoints.map((p) => [
      p.location.latitude,
      p.location.longitude,
    ]),
    currentUser: currentUser
      ? {
          ...currentUser,
          eventsToCome: await Promise.all(joinedEventsToCome.map(computeEvent)),
        }
      : null,
  };
  return json(data);
};

export const meta = () => ({
  title: 'Indie Collective - Community powered video game data',
  description: 'Video game related events around you and all over the world.',
  'og:title': 'Indie Collective - Community powered video game data',
  'og:description':
    'Video game related events around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Indie Collective - Community powered video game data',
  'twitter:description':
    'Video game related events around you and all over the world.',
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
          <Button
            as={Link}
            to="/games"
            rightIcon={<ChevronRightIcon />}
            colorScheme="gray"
            variant="ghost"
          >
            Explore games
          </Button>
        </Flex>

        <Fade in>
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
        </Fade>
      </Box>

      <PlacesWidget placesCount={placesCount} placesPoints={placesPoints} />

      <Grid gap={5} templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}>
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
              Studios
            </Heading>
            <Button
              as={Link}
              to="/studios"
              rightIcon={<ChevronRightIcon />}
              colorScheme="gray"
              variant="ghost"
            >
              Explore Studios
            </Button>
          </Flex>

          <Fade in>
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
          </Fade>
        </Box>

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
              Associations
            </Heading>
            <Button
              as={Link}
              to="/associations"
              rightIcon={<ChevronRightIcon />}
              colorScheme="gray"
              variant="ghost"
            >
              Explore Associations
            </Button>
          </Flex>

          <Fade in>
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
          </Fade>
        </Box>
      </Grid>

      <Box px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
        <Flex justify="space-between" align="center" mb={5}>
          <Heading as="h3" size="lg">
            Events
          </Heading>
          <Button
            as={Link}
            to="/events"
            rightIcon={<ChevronRightIcon />}
            colorScheme="gray"
            variant="ghost"
          >
            Explore Events
          </Button>
        </Flex>

        <Fade in>
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
        </Fade>
      </Box>
    </Box>
  );
};

export default HomePage;
