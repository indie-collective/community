import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Stack, Spinner } from '@chakra-ui/core';
import { motion } from 'framer-motion';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';

const entitiesQuery = gql`
  {
    entities(first: 100) {
      nodes {
        id
        name
        about
        type

        people {
          totalCount
        }

        games {
          totalCount
        }

        images {
          totalCount
        }

        events {
          totalCount
        }
      }
    }
  }
`;

const orgVariants = {
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

const Orgs = () => {
  const { loading, error, data } = useQuery(entitiesQuery);

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
        <Box mt={3} pl={5} pr={5}>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Stack spacing={3}>
              {data.entities.nodes.map(({ id, name, type, people, games }) => (
                <Box>
                  <motion.div variants={orgVariants}>
                    <OrgCard
                      id={id}
                      name={name}
                      type={type}
                      people={people}
                      games={games}
                    />
                  </motion.div>
                </Box>
              ))}
            </Stack>
          </motion.div>
        </Box>
      )}
    </div>
  );
};

export default withApollo({ssr: true})(Orgs);