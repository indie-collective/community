import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Fade,
} from '@chakra-ui/react';
import Head from 'next/head';
import { startOfDay } from 'date-fns';

import GameCard, {GameCardSkeleton} from '../components/GameCard';
import OrgCard, {OrgCardSkeleton} from '../components/OrgCard';
import EventCard, {EventCardSkeleton} from '../components/EventCard';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const authenticatedHomeQuery = gql`
  ${GameCard.fragments.game}
  ${OrgCard.fragments.org}
  ${EventCard.fragments.event}

  query authenticatedHome($currentDay: Datetime!) {
    currentPerson {
      id
      firstName
      avatar {
        url
      }
      eventsToCome: joinedEvents(
        first: 8
        orderBy: STARTS_AT_DESC
        filter: {
          endsAt: { greaterThanOrEqualTo: $currentDay }
          status: { notEqualTo: CANCELED }
        }
      ) {
        nodes {
          id
          startsAt
          ...EventCardEvent
        }
      }
    }

    games(first: 12, orderBy: CREATED_AT_DESC) {
      totalCount
      nodes {
        id
        ...GameCardGame
      }
    }

    entities(first: 12, orderBy: CREATED_AT_DESC) {
      totalCount
      nodes {
        id
        ...OrgCardOrg
      }
    }

    events {
      totalCount
    }

    eventsToCome: events(
      first: 8
      orderBy: STARTS_AT_ASC
      filter: {
        endsAt: { greaterThanOrEqualTo: $currentDay }
        status: { notEqualTo: CANCELED }
      }
    ) {
      nodes {
        id
        startsAt
        ...EventCardEvent
      }
    }
  }
`;

const AuthenticatedHomePageSkeleton = () => (
  <Box p={5} mb={5}>
    <Heading size="2xl" mb={10}>
      Welcome back
    </Heading>

    <Box mb={10}>
      <Heading as="h3" size="xl" mb={5}>
        Your upcoming events
      </Heading>

      <Fade in>
        <Grid
          gap={3}
          templateColumns={[
            '1fr',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
          ]}
        >
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
        </Grid>
      </Fade>
    </Box>

    <Box mb={10}>
      <Heading as="h3" size="xl" mb={5}>
        Recently added games
      </Heading>

      <Fade in>
        <Grid
          gap={3}
          templateColumns={[
            '2fr',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
            'repeat(6, 1fr)',
          ]}
        >
          {[...new Array(12)].map((_, i) => (
            <Box key={i} minW={0}>
              <GameCardSkeleton />
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
          {[...new Array(12)].map((_, i) => (
            <Box key={i} minW={0}>
              <OrgCardSkeleton />
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
        <Grid
          gap={3}
          templateColumns={[
            '1fr',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
          ]}
        >
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
          <Box minW={0}>
            <EventCardSkeleton />
          </Box>
        </Grid>
      </Fade>
    </Box>
  </Box>
);

const AuthenticatedHomePage = () => {
  const { data, loading } = useQuery(authenticatedHomeQuery, {
    variables: {
      currentDay: startOfDay(new Date()),
    },
  });

  if (loading) {
    return <AuthenticatedHomePageSkeleton />;
  }

  const { games, entities, eventsToCome } = data || {};
  const { firstName, eventsToCome: joinedEventsToCome } =
    data.currentPerson || {};

  return (
    <Box p={5} mb={5}>
      <Head>
        <title>Indie Collective - Community powered video game data</title>
      </Head>

      <Heading size="2xl" mb={10}>
        Welcome back {firstName}!
      </Heading>

      {joinedEventsToCome.nodes.length > 0 && (
        <Box mb={10}>
          <Heading as="h3" size="xl" mb={5}>
            Your upcoming events
          </Heading>

          <Grid
            gap={3}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
          >
            {joinedEventsToCome.nodes.map((event) => (
              <Box key={event.id} minW={0}>
                <Fade in>
                  <EventCard {...event} />
                </Fade>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added games
        </Heading>

        <Fade in>
          <Grid
            gap={3}
            templateColumns={[
              '2fr',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
              'repeat(6, 1fr)',
            ]}
          >
            {games.nodes.map((game) => (
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
            {entities.nodes.map((org) => (
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
          {eventsToCome.nodes.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {eventsToCome.nodes.map((event) => (
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

export default AuthenticatedHomePage;
