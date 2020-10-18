import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Spinner,
  Grid,
  Button,
  Stack,
  Tag,
  TagLabel,
  Badge,
} from '@chakra-ui/core';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import useCurrentPerson from '../hooks/useCurrentPerson';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import { useRouter } from 'next/router';

const gamesQuery = gql`
  ${GameCard.fragments.game}

  query getGames($tags: [TagFilter!]) {
    games(last: 30, filter: { gameTags: { some: { tag: { or: $tags } } } }) {
      nodes {
        id
        ...GameCardGame
      }
    }

    tags {
      nodes {
        id
        name
        games {
          totalCount
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
  const { query } = useRouter();
  const selectedTags = [].concat(query.tags || []);

  const currentPerson = useCurrentPerson();
  const { loading, error, data } = useQuery(gamesQuery, {
    variables: {
      tags: selectedTags.map((tag) => ({
        name: { equalTo: tag },
      })),
    },
  });

  const tags = loading ? [] : data.tags.nodes.slice();
  tags.sort((a, b) => b.games.totalCount - a.games.totalCount);

  const topTagCount = loading ? 0 : tags[0].games.totalCount;

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
          {currentPerson && (
            <Link href="/games/create">
              <Button
                display="block"
                m="auto"
                mb={10}
                size="lg"
                variantColor="teal"
                leftIcon="add"
              >
                Add a game
              </Button>
            </Link>
          )}

          <Stack
            isInline
            spacing={2}
            flexWrap="wrap"
            py={5}
            alignItems="flex-end"
          >
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                size={tag.games.totalCount < topTagCount / 4 ? 'sm' : 'lg'}
                marginBottom={2}
                variantColor="blue"
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                }}
                onClick={() => alert(tag.name)}
              >
                <Badge>{tag.games.totalCount}</Badge>
                <TagLabel pl={1}>{tag.name}</TagLabel>
              </Tag>
            ))}
          </Stack>

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
              {data.games.nodes.map((game) => (
                <Box key={game.id} minW={0}>
                  <motion.div variants={gameVariants}>
                    <GameCard {...game} />
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
