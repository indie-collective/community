import {
  Form,
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
  Button,
  Tag,
  TagLabel,
  Badge,
  Wrap,
  WrapItem,
  Fade,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import GameCard from '../components/GameCard';
import { getIGDBGame } from '../utils/igdb.server';

/**
 *
 * @param {*} options
 * @returns {import('@prisma/client').game[]} games
 */
async function getGames(options) {
  const games = await db.game.findMany(options);

  await Promise.all(
    games.map(async (g) => {
      if (g.igdb_slug) {
        g.igdb_game = await getIGDBGame(g.igdb_slug);
      } else {
        // search IGDB if there's a game with a similar name to suggest it
      }

      return g;
    })
  );

  return games;
}

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  const currentUser = await authenticator.isAuthenticated(request);

  const games = await getGames({
    where: searchParams.has('tags')
      ? {
          game_tag: {
            some: {
              tag: {
                name: {
                  in: searchParams.getAll('tags'),
                },
              },
            },
          },
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
      include: {
        game_tag: true,
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
    games,
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

    fetcher.load(`/games?page=${page}`);

    setShouldFetch(false);
  }, [clientHeight, scrollPosition, fetcher]);

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
      {currentUser && (
        <Box textAlign="center">
          <Button
            as={Link}
            to="/games/create"
            m="auto"
            mb={10}
            size="lg"
            colorScheme="teal"
            leftIcon={<AddIcon />}
          >
            Add a game
          </Button>
        </Box>
      )}

      <Wrap as={Form} spacing={2} mb={5} align="flex-end" method="get">
        {tags.map((tag) => (
          <WrapItem key={tag.id}>
            <Tag
              size={tag.game_tag.length < tags.length / 4 ? 'md' : 'lg'}
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
              <Badge
                ml={2}
                colorScheme="teal"
                variant={selectedTags.includes(tag.name) ? 'subtle' : 'solid'}
              >
                {tag.game_tag.length}
              </Badge>
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
