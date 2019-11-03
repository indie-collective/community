import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner, Stack } from '@chakra-ui/core';
import { motion } from 'framer-motion';

import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';

const gamesQuery = gql`
  {
    games(first: 10) {
      nodes {
        id
        name
        about
        site

        images {
          nodes {
            id
            imageFile
          }
        }
      }
    }
  }
`;

const gameVariants = {
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
  const { loading, error, data } = useQuery(gamesQuery);

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
            <Stack spacing={5}>
              {data.games.nodes.map(({ id, name, about, site, images }) => (
                <Box>
                  <motion.div variants={gameVariants}>
                    <GameCard
                      key={id}
                      width="45em"
                      id={id}
                      name={name}
                      about={about}
                      site={site}
                      images={images}
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
