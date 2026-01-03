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
  Flex,
  Button,
  Heading,
  Tag,
  TagLabel,
  Badge,
  Spacer,
  Wrap,
  WrapItem,
  Fade,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeGame from '../models/game';
import GameCard from '../components/GameCard';

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const selectedTags = searchParams.getAll('tags');

  const where = {
    deleted: false,
    ...(selectedTags.length > 0 && {
      AND: selectedTags.map((tag) => ({
        game_tag: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      })),
    }),
  };

  const [tags, games] = await Promise.all([
    db.tag.findMany({
      where: {
        game_tag: {
          some: {
            game: where,
          },
        },
      },
      include: {
        game_tag: {
          where: {
            game: where,
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
    db.game.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      skip: (page - 1) * 10,
      take: 10,
      include: {
        game_image: {
          include: {
            image: true,
          },
        },
        game_tag: {
          include: {
            tag: true,
          },
        },
        game_entity: {
          include: {
            entity: true,
          },
        },
      },
    }),
  ]);

  const data = {
    tags,
    games: await Promise.all(games.map(computeGame)),
  };

  return json(data);
};

export const meta = () => ({
  title: 'Games',
});

const Games = () => {
  const { games: initialGames, tags } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTags = searchParams.getAll('tags');

  const [games, setGames] = useState(initialGames);
  const fetcher = useFetcher();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [height, setHeight] = useState(null);

  const [shouldFetch, setShouldFetch] = useState(true);
  const [page, setPage] = useState(2);

  useEffect(() => {
    setGames(initialGames);
    setPage(2);
    setShouldFetch(true);
  }, [initialGames]);

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

    fetcher.load(`/games?page=${page}&${searchParams.toString()}`);

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
      <Wrap as={Form} spacing={2} mb={10} align="flex-end" method="get">
        {tags
          .slice(0, 30)
          .map((tag) => (
            <WrapItem key={tag.id}>
              <Tag
                size="md"
                variant="solid"
                colorScheme={selectedTags.includes(tag.name) ? 'green' : 'gray'}
                cursor="pointer"
                onClick={() =>
                  setSearchParams({
                    tags: selectedTags.includes(tag.name)
                      ? selectedTags.filter((t) => t !== tag.name)
                      : [...selectedTags, tag.name],
                  })
                }
              >
                <TagLabel>{tag.name}</TagLabel>
                <Box as="span" ml={2}>
                  <Badge variant="subtle">
                    {tag.game_tag.length}
                  </Badge>
                </Box>
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
          'repeat(3, 1fr)',
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

      {fetcher.state === 'loading' && (
        <Center py={10}>
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Center>
      )}
    </Box>
  );
};

export default Games;
