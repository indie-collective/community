import gql from 'graphql-tag';
import NextLink from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import { Button, Box, Spinner, Heading, Text, Grid } from '@chakra-ui/core';
import { motion } from 'framer-motion';
import Head from 'next/head';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';
import { useMemo } from 'react';
import Link from 'next/link';

const eventsQuery = gql`
  fragment EventSummary on Event {
    id
    name
    about
    site
    startsAt
    endsAt
    cover {
      thumbnail_url
    }
    location {
      id
      countryCode
      city
      latitude
      longitude
    }
    entities {
      totalCount
    }
    games {
      totalCount
    }
  }

  query getEvents($now: Datetime!) {
    events(
      filter: { endsAt: { greaterThanOrEqualTo: $now } }
      first: 3
      orderBy: STARTS_AT_ASC
    ) {
      nodes {
        ...EventSummary
      }
    }
    pastEvents: events(
      filter: { endsAt: { lessThan: $now } }
      first: 20
      orderBy: STARTS_AT_DESC
    ) {
      nodes {
        ...EventSummary
      }
    }
  }
`;

const eventVariants = {
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

const Events = () => {
  const now = useMemo(() => new Date(), []);
  const { data, error, loading } = useQuery(eventsQuery, {
    variables: { now },
  });

  return (
    <div>
      <Head>
        <title>Events</title>
        <meta name="description" content="Video game related events around you and all over the world." />
        <meta property="og:title" content="Events" />
        <meta property="og:description" content="Video game related events around you and all over the world." />

        <meta name="twitter:card" content={'summary'} />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content="Events" />
        <meta name="twitter:description" content="Video game related events around you and all over the world." />
      </Head>

      <Navigation />

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Spinner size="lg" />
        </Box>
      ) : (
        <Box p={5}>
          <Heading mb={4} mt={5}>
            Upcoming events
          </Heading>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid gap={3} templateColumns={["1fr", "1fr", "repeat(2, 1fr)", "repeat(3, 1fr)"]}>
              {data.events.nodes.length > 0 ? (
                data.events.nodes.map(
                  ({
                    id,
                    name,
                    cover,
                    games,
                    entities,
                    location,
                    startsAt,
                    endsAt,
                  }) => (
                    <Box minW={0}>
                      <motion.div variants={eventVariants}>
                        <Link key={id} href="/event/[id]" as={`/event/${id}`}>
                          <EventCard
                            key={id}
                            id={id}
                            name={name}
                            cover={cover}
                            startsAt={startsAt}
                            endsAt={endsAt}
                            games={games}
                            entities={entities}
                            location={location}
                          />
                        </Link>
                      </motion.div>
                    </Box>
                  )
                )
              ) : (
                <Box>
                  <Text fontSize="xl">No upcoming events yet :(</Text>
                </Box>
              )}
            </Grid>
          </motion.div>

          <NextLink href="/events/create">
            <Button
              display="block"
              m="auto"
              mt={10}
              size="lg"
              variantColor="teal"
              leftIcon="add"
            >
              Add an event
            </Button>
          </NextLink>

          <Heading mb={4} mt={5}>
            Past events
          </Heading>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid gap={3} templateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)"]}>
              {data.pastEvents.nodes.map(
                ({
                  id,
                  name,
                  cover,
                  games,
                  entities,
                  location,
                  startsAt,
                  endsAt,
                }) => (
                  <Box minW={0}>
                    <motion.div variants={eventVariants}>
                      <Link key={id} href="/event/[id]" as={`/event/${id}`}>
                        <EventCard
                          id={id}
                          name={name}
                          cover={cover}
                          startsAt={startsAt}
                          endsAt={endsAt}
                          games={games}
                          entities={entities}
                          location={location}
                        />
                      </Link>
                    </motion.div>
                  </Box>
                )
              )}
            </Grid>
          </motion.div>
        </Box>
      )}
    </div>
  );
};

export default withApollo()(Events);
