import { useCallback } from 'react';
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

const tagsQuery = gql`
  query getTags {
    tags(filter: { gameTagsExist: true }) {
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

const gamesQuery = gql`
  ${GameCard.fragments.game}

  query getGames($tags: [TagFilter!]) {
    games(last: 30, filter: { gameTags: { some: { tag: { or: $tags } } } }) {
      nodes {
        id
        ...GameCardGame
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
  const router = useRouter();
  const selectedTags = router.query.tags ? router.query.tags.split(',') : [];

  const currentPerson = useCurrentPerson();
  const { loading: loadingTags, data: dataTags } = useQuery(tagsQuery);
  const { loading: loadingGames, data: dataGames } = useQuery(gamesQuery, {
    variables: {
      tags: selectedTags.map((tag) => ({
        name: { equalTo: tag },
      })),
    },
  });

  const tags = loadingTags ? [] : dataTags.tags.nodes.slice();
  tags.sort((a, b) => b.games.totalCount - a.games.totalCount);

  const topTagCount = loadingTags ? 0 : tags[0].games.totalCount;

  const toggleQueryStringTag = useCallback(
    (tag) => {
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];

      const queryString = new URLSearchParams({
        ...router.query,
        tags: newSelectedTags,
      });

      if (newSelectedTags.length === 0) {
        queryString.delete('tags');
      }

      return queryString.toString() ? '?' + queryString.toString() : '';
    },
    [selectedTags, router.query]
  );

  return (
    <div>
      <Head>
        <title>Games</title>
      </Head>

      <Navigation />

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

        {loadingTags ? (
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
                  variant={
                    selectedTags.includes(tag.name) ? 'solid' : 'outline'
                  }
                  variantColor="teal"
                  cursor="pointer"
                  _hover={{
                    opacity: 0.8,
                  }}
                  onClick={() =>
                    router.replace(
                      router.pathname + toggleQueryStringTag(tag.name)
                    )
                  }
                >
                  <Badge>{tag.games.totalCount}</Badge>
                  <TagLabel pl={1}>{tag.name}</TagLabel>
                </Tag>
              ))}
            </Stack>

            {loadingGames ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <Spinner size="lg" />
              </Box>
            ) : (
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
                  {dataGames.games.nodes.map((game) => (
                    <Box key={game.id} minW={0}>
                      <motion.div variants={gameVariants}>
                        <GameCard {...game} />
                      </motion.div>
                    </Box>
                  ))}
                </Grid>
              </motion.div>
            )}
          </>
        )}
      </Box>
    </div>
  );
};

export default withApollo({ ssr: true })(Games);
