import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Flex,
  Button,
  Heading,
  Tag,
  TagLabel,
  Spacer,
  Wrap,
  WrapItem,
  Fade,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeGame from '../models/game';
import GameCard from '../components/GameCard';

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  const currentUser = await authenticator.isAuthenticated(request);

  const games = await db.game.findMany({
    where: searchParams.has('tags')
      ? {
          AND: searchParams.getAll('tags').map((name) => ({
            game_tag: {
              some: {
                tag: {
                  name,
                },
              },
            },
          })),
        }
      : undefined,
    orderBy: { updated_at: 'desc' },
    skip: (page - 1) * 10,
    take: 10,
    include: {
      game_image: {
        include: {
          image: true,
        },
      },
    },
  });

  const data = {
    tags: await db.tag.findMany({
      where: {
        game_tag: {
          some: {
            game: {
              deleted: false,
            },
          },
        },
      },
      include: {
        game_tag: {
          where: {
            game: {
              deleted: false,
            },
          },
        },
      },
      orderBy: [
        {
          game_tag: {
            _count: 'desc',
          },
        },
        {
          name: 'asc',
        },
      ],
    }),
    games: await Promise.all(games.map(computeGame)),
    currentUser,
  };
  return json(data);
};

export const meta = () => ({
  title: 'Games',
});

const Games = () => {
  const { games: initialGames, tags, currentUser } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTags = searchParams.getAll('tags');

  const [games, setGames] = useState(initialGames);
  const fetcher = useFetcher();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [height, setHeight] = useState(null);

  const [shouldFetch, setShouldFetch] = useState(true);
  const [page, setPage] = useState(2);

  // Set the height of the parent container whenever games are loaded
  const divHeight = useCallback(
    (node) => {
      if (node !== null) {
        setHeight(node.getBoundingClientRect().height);
      }
    },
    [games.length]
  );

  // Add Listeners to scroll and client resize
  useEffect(() => {
    const scrollListener = () => {
      setClientHeight(window.innerHeight);
      setScrollPosition(window.scrollY);
    };

    // Avoid running during SSR
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', scrollListener);
    }

    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', scrollListener);
      }
    };
  }, []);

  // Listen on scrolls. Fire on some self-described breakpoint
  useEffect(() => {
    if (!shouldFetch || !height) return;
    if (clientHeight + scrollPosition + 100 < height) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    fetcher.load(`/games?${params.toString()}`);

    setShouldFetch(false);
  }, [clientHeight, scrollPosition, fetcher, searchParams]);

  // Merge games, increment page, and allow fetching again
  useEffect(() => {
    // Discontinue API calls if the last page has been reached
    if (fetcher.data && fetcher.data.games.length === 0) {
      setShouldFetch(false);
      return;
    }

    // Games contain data, merge them and allow the possiblity of another fetch
    if (fetcher.data && fetcher.data.games.length > 0) {
      setGames((prevGames) => [...prevGames, ...fetcher.data.games]);
      setPage((page) => page + 1);
      setShouldFetch(true);
    }
  }, [fetcher.data]);

  return (
    <Box p={5} ref={divHeight}>
      <Flex minWidth="max-content" alignItems="center" gap="2" mb={6}>
        <Box p="2">
          <Heading size="2xl">Games</Heading>
        </Box>
        <Spacer />
        {currentUser && (
          <Button
            as={Link}
            to="/games/create"
            colorScheme="teal"
            leftIcon={<AddIcon />}
          >
            Add game
          </Button>
        )}
      </Flex>

      <Wrap spacing={2} mb={10} align="flex-end">
        {tags.map((tag) => (
          <WrapItem key={tag.id}>
            <Tag
              variant={selectedTags.includes(tag.name) ? 'solid' : 'outline'}
              colorScheme={selectedTags.includes(tag.name) ? 'teal' : 'gray'}
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              onClick={() =>
                setSearchParams({
                  tags: selectedTags.includes(tag.name)
                    ? selectedTags.filter((t) => t !== tag.name)
                    : [...selectedTags, tag.name],
                })
              }
            >
              <TagLabel>{tag.name}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <Grid
        gap={5}
        templateColumns={[
          '1fr',
          'repeat(2, 1fr)',
          'repeat(3, 1fr)',
          'repeat(4, 1fr)',
        ]}
      >
        {games.map((game) => (
          <Box key={game.id} minW={0}>
            <Fade in>
              <GameCard {...game} />
            </Fade>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default Games;
