import { Box, Heading, Text, Grid, Image, Fade } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import getImageLinks from '../utils/imageLinks.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import AuthenticatedHomePage from '../components/AuthenticatedHomePage';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request);

  const data = {
    games: await db.game
      .findMany({
        include: {
          game_image: {
            include: {
              image: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 12,
      })
      .then((games) =>
        games.map((game) => ({
          ...game,
          images: game.game_image.map(({ image }) => getImageLinks(image)),
        }))
      ),
    entities: await db.entity
      .findMany({
        include: {
          location: true,
          logo: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 12,
      })
      .then((entities) =>
        entities.map((entity) => ({
          ...entity,
          logo: entity.logo ? getImageLinks(entity.logo) : null,
        }))
      ),
    events: await db.event
      .findMany({
        include: {
          event_participant: true,
          game_event: true,
          location: true,
          cover: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 12,
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          cover: event.cover ? getImageLinks(event.cover) : null,
        }))
      ),
    eventsToCome: await db.event
      .findMany({
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
          game_event: true,
          location: true,
          cover: true,
        },
        orderBy: {
          starts_at: 'asc',
        },
        take: 8,
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          cover: event.cover ? getImageLinks(event.cover) : null,
        }))
      ),
    currentUser: currentUser
      ? {
          ...currentUser,
          eventsToCome: await db.event
            .findMany({
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
                game_event: true,
                location: true,
                cover: true,
              },
              orderBy: {
                starts_at: 'desc',
              },
              take: 8,
            })
            .then((events) =>
              events.map((event) => ({
                ...event,
                cover: event.cover ? getImageLinks(event.cover) : null,
              }))
            ),
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

const LandingPage = () => {
  const { games, entities, events, eventsToCome } = useLoaderData();

  return (
    <Box mb={5} px={5}>
      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added games
        </Heading>

        <Fade in>
          <Grid
            gap={5}
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

      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added orgs
        </Heading>

        <Fade in>
          <Grid
            mb={5}
            gap={3}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
          >
            {entities.map((org) => (
              <Box key={org.id} minW={0}>
                <OrgCard key={org.id} {...org} />
              </Box>
            ))}
          </Grid>
        </Fade>
      </Box>

      <Box>
        <Heading as="h3" size="xl" mb={5}>
          Upcoming events
        </Heading>

        <Fade in>
          {eventsToCome.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
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
                No upcoming events yet, sadly.
              </Text>
            </Box>
          )}
        </Fade>
      </Box>
    </Box>
  );
};

const Home = () => {
  const { currentUser } = useLoaderData();

  return currentUser ? <AuthenticatedHomePage /> : <LandingPage />;
};

export default Home;
