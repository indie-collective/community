import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Box, Stack, Spinner } from '@chakra-ui/core';
import { motion } from 'framer-motion';

import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';

const eventsQuery = gql`
  {
    events(first: 10) {
      nodes {
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
  const { loading, error, data } = useQuery(eventsQuery);

  return (
    <div>
      <Navigation />
      {loading ? (
        <Spinner />
      ) : (
        <Box mt={3} pl={5} pr={5}>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Stack spacing={3}>
              {data.events.nodes.map(
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
      )}
    </div>
  );
};
