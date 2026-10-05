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
  Center,
  Spinner,
  Presence,
  Input,
  InputGroup,
  NativeSelect,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { LuPlus, LuSearch } from 'react-icons/lu';

import { db } from '../utils/db.server';
import computeGame from '../models/game';
import GameCard from '../components/GameCard';
import useDebounce from '../hooks/useDebounce';
import { pageMeta } from '../utils/meta';
import countryNames from '../assets/countries.json';

// The sort options: user input picks one by name, never reaches Prisma.
const SORTS = {
  updated: { label: 'Recently updated', orderBy: { updated_at: 'desc' } },
  newest: { label: 'Recently added', orderBy: { created_at: 'desc' } },
  name: { label: 'Name (A–Z)', orderBy: { name: 'asc' } },
};
const DEFAULT_SORT = 'updated';

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const selectedTags = searchParams.getAll('tags');
  const q = searchParams.get('q')?.trim() || null;
  const sort = SORTS[searchParams.get('sort')]
    ? searchParams.get('sort')
    : DEFAULT_SORT;
  // Games made in a country: by one of its studios (#258).
  const countryCode = searchParams.get('country')?.toUpperCase();
  const country = countryNames[countryCode] ? countryCode : null;

  const where = {
    deleted: false,
    ...(country && {
      game_entity: {
        some: { entity: { location: { country_code: country } } },
      },
    }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { about: { contains: q, mode: 'insensitive' } },
      ],
    }),
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
      // id last, so pages don't overlap when sorted values tie.
      orderBy: [SORTS[sort].orderBy, { id: 'asc' }],
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
    q: q ?? '',
    sort,
    country: country && { code: country, name: countryNames[country] },
  };

  return data;
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Games',
    description:
      'Indie games from the community: browse them by tag, see who made them and where they were shown.',
    path: location.pathname,
  });

const Games = () => {
  const { games: initialGames, tags, q, sort, country } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTags = searchParams.getAll('tags');

  // Change some parameters and keep the others (search, sort, tags).
  const updateParams = useCallback(
    (changes, options) =>
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.delete('page');
        for (const [key, value] of Object.entries(changes)) {
          next.delete(key);
          for (const v of [].concat(value ?? []))
            if (v !== '') next.append(key, v);
        }
        return next;
      }, options),
    [setSearchParams]
  );

  const [query, setQuery] = useState(q);
  // Follow the URL when it changes elsewhere (back button, links).
  useEffect(() => setQuery(q), [q]);
  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => {
    if (debouncedQuery.trim() !== q)
      updateParams({ q: debouncedQuery.trim() }, { replace: true });
  }, [debouncedQuery]);

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
      <Flex gap={3} mb={5} wrap="wrap" align="center">
        <InputGroup startElement={<LuSearch />} maxW="320px" flex="1 1 220px">
          <Input
            type="search"
            aria-label="Search games"
            placeholder="Search games"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <NativeSelect.Root size="md" width="auto">
          <NativeSelect.Field
            aria-label="Sort by"
            value={sort}
            onChange={(event) =>
              updateParams({
                sort:
                  event.target.value === 'updated' ? '' : event.target.value,
              })
            }
          >
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        {country && (
          <Tag.Root size="lg" variant="subtle" colorPalette="green">
            <Tag.Label>Made in {country.name}</Tag.Label>
            <Tag.EndElement>
              <Tag.CloseTrigger
                aria-label={`Show games from every country`}
                onClick={() => updateParams({ country: '' })}
              />
            </Tag.EndElement>
          </Tag.Root>
        )}
      </Flex>
      <Wrap
        gap={2}
        mb={10}
        align="flex-end"
        role="group"
        aria-label="Filter by tag"
      >
        {tags.slice(0, 30).map((tag) => {
          const selected = selectedTags.includes(tag.name);
          return (
            <WrapItem key={tag.id}>
              {/* A real toggle button, so the filter works with the keyboard (#224). */}
              <Tag.Root
                asChild
                size="lg"
                variant="solid"
                colorPalette={selected ? 'green' : 'gray'}
                // v3's solid gray is near-black; v2's unselected chips were gray.500.
                {...(!selected && {
                  bg: 'gray.500',
                  color: 'white',
                })}
                cursor="pointer"
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    updateParams({
                      tags: selected
                        ? selectedTags.filter((t) => t !== tag.name)
                        : [...selectedTags, tag.name],
                    })
                  }
                >
                  <Tag.Label>{tag.name}</Tag.Label>
                  <Badge variant="subtle" ml={1}>
                    {tag.game_tag.length}
                  </Badge>
                </button>
              </Tag.Root>
            </WrapItem>
          );
        })}
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
            <Presence
              present
              animationName={{
                _open: 'fade-in',
                _closed: 'fade-out',
              }}
              animationDuration="moderate"
            >
              <GameCard {...game} />
            </Presence>
          </Box>
        ))}
      </Grid>
      {fetcher.state === 'loading' && (
        <Center py={10}>
          <Spinner size="xl" color="green.500" borderWidth="4px" />
        </Center>
      )}
    </Box>
  );
};

export default Games;
