import { gql } from 'apollo-boost';
import NextLink from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import { Link, Button, Box, Stack, Spinner, Heading } from '@chakra-ui/core';
import { motion } from 'framer-motion';

import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';
import { useMemo } from 'react';

const eventsQuery = gql`
  fragment EventSummary on Event {
    id
    name
    about
    site
    startsAt
    endsAt
    location {
      id
      country
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
    events(filter: {endsAt: {greaterThanOrEqualTo: $now}}, first: 5, orderBy: STARTS_AT_ASC) {
      nodes {
        ...EventSummary
      }
    }
    pastEvents: events(filter: {endsAt: {lessThan: $now}}, first: 5, orderBy: STARTS_AT_DESC) {
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

export default () => {
  const now = useMemo(() => new Date(), []);
  const {data, error, loading} = useQuery(eventsQuery, {variables: {now}});

  return (
    <div>
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
        <>
          <Heading>Upcoming events</Heading>
          <Box mt={3} pl={5} pr={5}>
            <motion.div
              initial="initial"
              animate="enter"
              exit="exit"
              variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
            >
              <Stack spacing={3}>
                {data.events.nodes.length > 0 ? data.events.nodes.map(
                  ({ id, name, games, entities, location, startsAt, endsAt }) => (
                    <Box>
                      <motion.div variants={eventVariants}>
                        <EventCard
                          key={id}
                          id={id}
                          name={name}
                          startsAt={startsAt}
                          endsAt={endsAt}
                          games={games}
                          entities={entities}
                          location={location}
                        />
                      </motion.div>
                    </Box>
                  )
                ) : (
                  <Box>
                    There are no events currently planned. <Link as={NextLink} href="/events/add">Add one ?</Link>
                  </Box>
                )}
              </Stack>
            </motion.div>
          </Box>

          <Heading>Past events</Heading>
          <Box mt={3} pl={5} pr={5}>
            <motion.div
              initial="initial"
              animate="enter"
              exit="exit"
              variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
            >
              <Stack spacing={3}>
                {data.pastEvents.nodes.map(
                  ({ id, name, games, entities, location, startsAt, endsAt }) => (
                    <Box>
                      <motion.div variants={eventVariants}>
                        <EventCard
                          key={id}
                          id={id}
                          name={name}
                          startsAt={startsAt}
                          endsAt={endsAt}
                          games={games}
                          entities={entities}
                          location={location}
                        />
                      </motion.div>
                    </Box>
                  )
                )}
              </Stack>
            </motion.div>
          </Box>
        </>
      )}
    </div>
  );
};
