import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner, Grid, Heading } from '@chakra-ui/core';
import { motion } from 'framer-motion';
import Head from 'next/head';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import Link from 'next/link';

const gamesQuery = gql`
  {
    games(last: 30) {
      nodes {
        id
        name
        about
        site

        images {
          nodes {
            id
            thumbnail_url
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

const Games = () => {
  const { loading, error, data } = useQuery(gamesQuery);

  return (
    <div>
      <Head>
        <title>Games</title>
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
            Latest games
          </Heading>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid
              gap={5}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {data.games.nodes.map(({ id, name, about, site, images }) => (
                <Box key={id} minW={0}>
                  <motion.div variants={gameVariants}>
                    <GameCard
                      id={id}
                      name={name}
                      about={about}
                      site={site}
                      images={images}
                    />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}
    </div>
  );
};

export default withApollo({ ssr: true })(Games);
