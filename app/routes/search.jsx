import { Box, Button, Grid, Heading, HStack, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight, LuPlus } from 'react-icons/lu';
import { Link, useLoaderData } from 'react-router';

import { searchSite } from '../data/site.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import SearchMatch from '../components/SearchMatch';

// The kinds of results, in the order the page shows them (#306).
const KINDS = [
  { kind: 'game', label: 'Games', one: 'game', Card: GameCard },
  { kind: 'studio', label: 'Studios', one: 'studio', Card: OrgCard },
  {
    kind: 'association',
    label: 'Associations',
    one: 'association',
    Card: OrgCard,
  },
  { kind: 'event', label: 'Events', one: 'event', Card: EventCard },
];
const PREVIEW_SIZE = 6;
const PAGE_SIZE = 24;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const kind = KINDS.some((k) => k.kind === searchParams.get('kind'))
    ? searchParams.get('kind')
    : null;
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const found = await searchSite(
    q,
    kind
      ? { kind, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
      : { limit: PREVIEW_SIZE }
  );
  return {
    q,
    kind,
    page,
    counts: found?.counts ?? null,
    results: found?.results ?? {},
  };
};

export const meta = ({ data }) => [
  {
    title: data?.q
      ? `“${data.q}” | Search | Indie Collective`
      : 'Search | Indie Collective',
  },
  { name: 'robots', content: 'noindex' },
];

const searchHref = ({ q, kind, page }) => {
  const params = new URLSearchParams({ q });
  if (kind) params.set('kind', kind);
  if (page > 1) params.set('page', page);
  return `/search?${params}`;
};

const plural = (count, one) =>
  `${count.toLocaleString('en')} ${one}${count === 1 ? '' : 's'}`;

// All, Games, Studios, Associations, Events, with how many each has.
const Tabs = ({ q, kind, counts }) => {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const tabs = [{ kind: null, label: 'All', count: total }].concat(
    KINDS.map((k) => ({ ...k, count: counts[k.kind] }))
  );
  return (
    <HStack as="nav" aria-label="Kinds of results" wrap="wrap" gap={2} mb={6}>
      {tabs.map((tab) => {
        const current = tab.kind === kind;
        return (
          <Button
            key={tab.label}
            asChild
            size="sm"
            borderRadius="full"
            variant={current ? 'solid' : 'outline'}
            colorPalette={current ? 'green' : 'gray'}
            opacity={tab.count === 0 && !current ? 0.6 : 1}
          >
            <Link
              to={searchHref({ q, kind: tab.kind })}
              aria-current={current ? 'page' : undefined}
            >
              {tab.label}{' '}
              <Text as="span" fontWeight="normal">
                {tab.count.toLocaleString('en')}
              </Text>
            </Link>
          </Button>
        );
      })}
    </HStack>
  );
};

const Results = ({ kind, records }) => {
  const { Card } = KINDS.find((k) => k.kind === kind);
  return (
    <Grid
      as="ul"
      listStyleType="none"
      gap={4}
      templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
    >
      {records.map((record) => (
        <Box as="li" key={record.id} minW={0}>
          <Card {...record} />
          <SearchMatch kind={kind} match={record.search_match} />
        </Box>
      ))}
    </Grid>
  );
};

const Pages = ({ q, kind, page, count }) => {
  const pages = Math.ceil(count / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <HStack as="nav" aria-label="Pages" justify="center" gap={4} mt={8}>
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        {page > 1 ? (
          <Link to={searchHref({ q, kind, page: page - 1 })} rel="prev">
            <LuChevronLeft /> Previous
          </Link>
        ) : (
          <span>
            <LuChevronLeft /> Previous
          </span>
        )}
      </Button>
      <Text color="muted">
        Page {page} of {pages}
      </Text>
      <Button asChild variant="outline" size="sm" disabled={page >= pages}>
        {page < pages ? (
          <Link to={searchHref({ q, kind, page: page + 1 })} rel="next">
            Next <LuChevronRight />
          </Link>
        ) : (
          <span>
            Next <LuChevronRight />
          </span>
        )}
      </Button>
    </HStack>
  );
};

const NoResults = ({ q }) => (
  <Box py={10} textAlign="center">
    <Text fontSize="xl" mb={2}>
      Nothing matches “{q}”.
    </Text>
    <Text color="muted" mb={6}>
      Every word has to match the start of a word: try fewer or shorter words.
    </Text>
    <Text fontWeight="semibold" mb={3}>
      Know one we're missing?
    </Text>
    <HStack justify="center" wrap="wrap" gap={2}>
      {[
        ['/games/create', 'Add a game'],
        ['/orgs/create', 'Add a studio or association'],
        ['/events/create', 'Add an event'],
      ].map(([to, label]) => (
        <Button key={to} variant="outline" size="sm" asChild>
          <Link to={to}>
            <LuPlus />
            {label}
          </Link>
        </Button>
      ))}
    </HStack>
  </Box>
);

const SearchPage = () => {
  const { q, kind, page, counts, results } = useLoaderData();

  if (!counts) {
    return (
      <Box p={5} mb={5}>
        <Heading as="h1" size="2xl" mb={3}>
          Search
        </Heading>
        <Text color="muted" fontSize="lg">
          Find games, studios, associations and events by name, place, tag or
          studio, from the search box above.
        </Text>
      </Box>
    );
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const current = KINDS.find((k) => k.kind === kind);

  return (
    <Box p={5} mb={5}>
      <Heading as="h1" size="2xl" mb={4}>
        Results for “{q}”
      </Heading>
      <Tabs q={q} kind={kind} counts={counts} />

      {total === 0 ? (
        <NoResults q={q} />
      ) : current ? (
        counts[kind] === 0 ? (
          <Text color="muted">
            No {current.label.toLowerCase()} match “{q}”.
          </Text>
        ) : (
          <>
            <Results kind={kind} records={results[kind]} />
            <Pages q={q} kind={kind} page={page} count={counts[kind]} />
          </>
        )
      ) : (
        KINDS.filter((k) => counts[k.kind] > 0).map((k) => (
          <Box
            as="section"
            key={k.kind}
            aria-labelledby={`results-${k.kind}`}
            mb={10}
          >
            <HStack justify="space-between" align="baseline" mb={4} wrap="wrap">
              <Heading as="h2" size="xl" id={`results-${k.kind}`}>
                {k.label}{' '}
                <Text as="span" color="muted" fontWeight="normal">
                  {counts[k.kind].toLocaleString('en')}
                </Text>
              </Heading>
              {counts[k.kind] > results[k.kind].length && (
                <Button asChild variant="ghost" colorPalette="gray" size="sm">
                  <Link to={searchHref({ q, kind: k.kind })}>
                    See all {plural(counts[k.kind], k.one)}
                    <LuChevronRight />
                  </Link>
                </Button>
              )}
            </HStack>
            <Results kind={k.kind} records={results[k.kind]} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default SearchPage;
