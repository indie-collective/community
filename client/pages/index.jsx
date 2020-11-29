import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Spinner,
  Heading,
  Text,
  Grid,
  StatGroup,
  StatLabel,
  StatNumber,
  Stat,
  Image,
} from '@chakra-ui/react';
import Head from 'next/head';
import { startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

import { withApollo } from '../lib/apollo';
import useCurrentPerson from '../hooks/useCurrentPerson';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
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

const variants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
};

const LandingPage = () => {
  const { loading, error, data } = useQuery(homeQuery, {
    variables: {
      currentDay: startOfDay(new Date()),
    },
  });

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Spinner size="lg" />
      </Box>
    );
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

        <motion.div
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
        >
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
                <motion.div variants={variants}>
                  <GameCard {...game} />
                </motion.div>
              </Box>
            ))}
          </Grid>
        </motion.div>
      </Box>

      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added orgs
        </Heading>

        <motion.div
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
        >
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
                <motion.div variants={variants}>
                  <OrgCard key={org.id} {...org} />
                </motion.div>
              </Box>
            ))}
          </Grid>
        </motion.div>
      </Box>

      <Box>
        <Heading as="h3" size="xl" mb={5}>
          Upcoming events
        </Heading>

        <motion.div
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
        >
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
                  <motion.div variants={variants}>
                    <EventCard {...event} />
                  </motion.div>
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
        </motion.div>
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

export default withApollo()(Home);
