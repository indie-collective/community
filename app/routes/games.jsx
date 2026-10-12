import {
  Box,
  Grid,
  Flex,
  Button,
  Tag,
  Badge,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  NativeSelect,
  Group,
  Image,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import Link from '../components/Link';
import { LuLayoutGrid, LuList, LuPlus, LuSearch } from 'react-icons/lu';

import { countGames, listGames } from '../data/games.server';
import { FilterBar, Page, PageHeader } from '../components/Page';
import GameCard, { GameCardSkeleton } from '../components/GameCard';
import { Row, RowList } from '../components/kit/RowList';
import usePlaceholder from '../hooks/usePlaceholder';
import { gamePath } from '../utils/slug';
import useDebounce from '../hooks/useDebounce';
import { pageMeta } from '../utils/meta';
import countryNames from '../assets/countries.json';
import Reveal from '../components/Reveal';

// The sort options: user input picks one by name, never reaches the query.
// The orders the list offers; data/games knows how to apply them.
const SORTS = {
  updated: { label: 'Recently updated', summary: 'recently updated first' },
  newest: { label: 'Recently added', summary: 'newest first' },
  name: { label: 'Name (A–Z)', summary: 'by name' },
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

  const [{ tags, games, matching }, total] = await Promise.all([
    listGames({ page, tags: selectedTags, q, sort, country }),
    countGames(),
  ]);

  const data = {
    total,
    matching,
    // Cards, or a denser list (design pass); kept in the URL.
    view: searchParams.get('view') === 'list' ? 'list' : 'cards',
    tags,
    games,
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

// "146 games tagged action, made in France · recently updated first".
function summary({ matching, selectedTags, country, q, sort }) {
  const parts = [
    `${matching.toLocaleString('en')} ${matching === 1 ? 'game' : 'games'}`,
  ];
  const filters = [
    selectedTags.length > 0 && `tagged ${selectedTags.join(' and ')}`,
    country && `made in ${country.name}`,
    q && `matching “${q}”`,
  ].filter(Boolean);
  return `${parts.concat(filters.join(', ')).filter(Boolean).join(' ')} · ${SORTS[sort].summary}`;
}

// A game's first image, small, for list rows.
const GameThumb = ({ game }) => {
  const placeholder = usePlaceholder();
  const src =
    game.images?.[0]?.thumbnail_url ??
    game.igdb_game?.screenshots?.[0]?.url?.replace(
      't_thumb',
      't_screenshot_med'
    ) ??
    placeholder;
  return (
    <Image
      src={src}
      alt=""
      w="64px"
      h="36px"
      objectFit="cover"
      borderRadius="md"
      flexShrink={0}
    />
  );
};

const Games = () => {
  const {
    games: initialGames,
    tags,
    q,
    sort,
    country,
    total,
    matching,
    view,
  } = useLoaderData();
  const { currentUser } = useRouteLoaderData('root') ?? {};
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

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2);
  // The last page asked for, so a page is never requested twice.
  const requested = useRef(1);

  useEffect(() => {
    setGames(initialGames);
    setPage(2);
    setHasMore(true);
    requested.current = 1;
  }, [initialGames]);

  // Whether the end of the list is in view, scrolled to or not: when the
  // first page fits on a tall screen, there's nothing to scroll, and the
  // next pages must still load.
  const end = useRef(null);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const node = end.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setAtEnd(entry.isIntersecting),
      { rootMargin: '0px 0px 200px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Merge each loaded page; an empty one means there are no more.
  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.games.length === 0) {
      setHasMore(false);
      return;
    }
    setGames((prevGames) => [...prevGames, ...fetcher.data.games]);
    setPage((current) => current + 1);
  }, [fetcher.data]);

  // Load the next page while the end is in view, until there are no more.
  useEffect(() => {
    if (!atEnd || !hasMore || fetcher.state !== 'idle') return;
    if (requested.current >= page) return;
    requested.current = page;
    fetcher.load(`/games?page=${page}&${searchParams.toString()}`);
  }, [atEnd, hasMore, fetcher.state, page, searchParams]);

  return (
    <Page>
      <PageHeader
        title="Games"
        description={`Indie games from the community, with who made them and where they were shown: ${total.toLocaleString('en')} so far.`}
        actions={
          currentUser && (
            <Button asChild size="sm">
              <Link to="/games/create">
                <LuPlus />
                Add a game
              </Link>
            </Button>
          )
        }
      />
      <FilterBar direction="column" align="stretch" wrap="nowrap">
        <Flex gap={3} wrap="wrap" align="center">
          <InputGroup
            startElement={<LuSearch />}
            maxW="320px"
            flex="1 1 220px"
            size="sm"
          >
            <Input
              type="search"
              aria-label="Search games"
              placeholder="Search games"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <NativeSelect.Root size="sm" width="auto">
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
        <Wrap gap={2} role="group" aria-label="Filter by tag">
          {tags.slice(0, 30).map((tag) => {
            const selected = selectedTags.includes(tag.name);
            return (
              <WrapItem key={tag.id}>
                {/* A real toggle button, so the filter works with the keyboard (#224). */}
                <Tag.Root
                  asChild
                  size="lg"
                  // Neutral until picked, then green (design pass).
                  variant={selected ? 'solid' : 'subtle'}
                  colorPalette={selected ? 'green' : 'gray'}
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
      </FilterBar>
      {/* What the list shows, and how (design pass). */}
      <Flex justify="space-between" align="center" gap={3} wrap="wrap" mb={4}>
        <Text color="muted" fontSize="sm" aria-live="polite">
          {summary({ matching, selectedTags, country, q, sort })}
        </Text>
        <Group attached role="group" aria-label="View">
          {[
            ['cards', 'Cards', LuLayoutGrid],
            ['list', 'List', LuList],
          ].map(([value, label, Icon]) => (
            <Button
              key={value}
              size="xs"
              variant={view === value ? 'solid' : 'outline'}
              colorPalette="gray"
              aria-pressed={view === value}
              onClick={() =>
                updateParams(
                  { view: value === 'cards' ? '' : value },
                  { replace: true }
                )
              }
            >
              <Icon />
              {label}
            </Button>
          ))}
        </Group>
      </Flex>
      {view === 'list' ? (
        <RowList aria-label="Games">
          {games.map((game) => (
            <Row
              key={game.id}
              to={gamePath(game)}
              start={<GameThumb game={game} />}
              title={game.name}
              sub={[
                game.entities?.map((entity) => entity.name).join(', '),
                game.tags
                  ?.slice(0, 3)
                  .map((tag) => tag.name)
                  .join(', '),
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </RowList>
      ) : (
        <Grid
          gap={5}
          templateColumns={[
            '1fr',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(3, 1fr)',
          ]}
        >
          {games.map((game, index) => (
            <Box key={game.id} minW={0}>
              <Reveal index={index}>
                <GameCard {...game} />
              </Reveal>
            </Box>
          ))}
        </Grid>
      )}
      <Box ref={end} aria-hidden />
      {/* Placeholders where the next games will be, while they load. */}
      {fetcher.state === 'loading' && (
        <Grid
          gap={5}
          mt={5}
          templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          aria-busy="true"
          aria-label="Loading more games"
        >
          {[0, 1, 2].map((i) => (
            <GameCardSkeleton key={i} />
          ))}
        </Grid>
      )}
    </Page>
  );
};

export default Games;
