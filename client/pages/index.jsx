import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Heading,
  Text,
  Grid,
  StatGroup,
  StatLabel,
  StatNumber,
  Stat,
  Image,
  SkeletonText,
  Fade,
} from '@chakra-ui/react';
import Head from 'next/head';
import { startOfDay } from 'date-fns';

import { withApollo } from '../lib/apollo';
import useCurrentPerson from '../hooks/useCurrentPerson';
import Navigation from '../components/Navigation';
import GameCard, { GameCardSkeleton } from '../components/GameCard';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';
import EventCard, { EventCardSkeleton } from '../components/EventCard';
import AuthenticatedHomePage from '../components/AuthenticatedHomePage';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const homeQuery = gql`
  ${GameCard.fragments.game}
  ${OrgCard.fragments.org}
  ${EventCard.fragments.event}

  query home($currentDay: Datetime!) {
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

const LandingPageSkeleton = () => (
  <Box p={5} mb={5}>
    <Box py={5} mb={10} textAlign="center">
      <Box m="auto" width={['auto', 'auto', '75%', '50%']}>
        <Heading mb={5} size="2xl">
          Find Your Community
        </Heading>

        <Text mb={5}>
          Community lets you explore indie game-focused data around the world.
          <br />
          Discover who, where and what has been / is being made near you through
          crowd-sourced data.
        </Text>

        <StatGroup my={2}>
          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>

          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>

          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>
        </StatGroup>
      </Box>
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

const LandingPage = () => {
  const { loading, error, data } = useQuery(homeQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      currentDay: startOfDay(new Date()),
    },
  });

  if (loading) {
    return <LandingPageSkeleton />;
  }

  const { games, entities, events, eventsToCome } = data;

  return (
    <Box p={5} mb={5}>
      <Head>
        <title>Indie Collective - Community powered video game data</title>
        <meta
          name="description"
          content="Video game related events around you and all over the world."
        />
        <meta
          property="og:title"
          content="Indie Collective - Community powered video game data"
        />
        <meta
          property="og:description"
          content="Video game related events around you and all over the world."
        />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@IndieColle" />
        <meta
          name="twitter:title"
          content="Indie Collective - Community powered video game data"
        />
        <meta
          name="twitter:description"
          content="Video game related events around you and all over the world."
        />
      </Head>

      <Box py={5} mb={10} textAlign="center">
        <Box m="auto" width={['auto', 'auto', '75%', '50%']}>
          <Heading mb={5} size="2xl">
            Find Your Community
          </Heading>

          <Text mb={5}>
            Community lets you explore indie game-focused data around the world.
            <br />
            Discover who, where and what has been / is being made near you
            through crowd-sourced data.
          </Text>

          <StatGroup my={2}>
            <Stat>
              <StatNumber>{games.totalCount}</StatNumber>
              <StatLabel>games</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{entities.totalCount}</StatNumber>
              <StatLabel>orgs</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{events.totalCount}</StatNumber>
              <StatLabel>events</StatLabel>
            </Stat>
          </StatGroup>
        </Box>
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

const Home = () => {
  const currentPerson = useCurrentPerson();

  return (
    <Box>
      <Navigation />

      {currentPerson ? <AuthenticatedHomePage /> : <LandingPage />}
    </Box>
  );
};

export default withApollo({ ssr: true })(Home);
