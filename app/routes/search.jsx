import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Image,
  Text,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight, LuPlus } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import Link from '../components/Link';

import { searchSite } from '../data/site.server';
import SearchMatch from '../components/SearchMatch';
import { Row, RowList } from '../components/kit/RowList';
import DateBadge from '../components/kit/DateBadge';
import KindDot from '../components/kit/KindDot';
import CountryCode from '../components/kit/CountryCode';
import { formatEventRange } from '../utils/eventTime';
import { eventPath, gamePath, orgPath } from '../utils/slug';

const PATHS = {
  game: gamePath,
  studio: orgPath,
  association: orgPath,
  event: eventPath,
};
import { Page, PageHeader } from '../components/Page';

// The kinds of results, in the order the page shows them (#306).
const KINDS = [
  { kind: 'game', label: 'Games', one: 'game' },
  { kind: 'studio', label: 'Studios', one: 'studio' },
  {
    kind: 'association',
    label: 'Associations',
    one: 'association',
  },
  { kind: 'event', label: 'Events', one: 'event' },
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

// What a result is, when its match doesn't say: a game's studios, an
// organisation's place, an event's date and place.
const describe = (kind, record) => {
  if (kind === 'game')
    return record.entities?.map((entity) => entity.name).join(', ');
  if (kind === 'event') {
    return [
      formatEventRange(record.starts_at, record.ends_at, record.time_zone, {
        time: false,
      }),
      record.location?.city,
    ]
      .filter(Boolean)
      .join(' · ');
  }
  return record.location?.city;
};

const thumbnail = (kind, record) =>
  kind === 'game'
    ? (record.images?.[0]?.thumbnail_url ??
      record.igdb_game?.screenshots?.[0]?.url?.replace(
        't_thumb',
        't_screenshot_med'
      ))
    : record.logo?.thumbnail_url;

// Results as rows (design pass): what it is, and why it matched.
const Results = ({ kind, records }) => (
  <RowList>
    {records.map((record) => {
      const image = kind !== 'event' && thumbnail(kind, record);
      return (
        <Row
          key={record.id}
          to={PATHS[kind](record)}
          start={
            kind === 'event' ? (
              <DateBadge value={record.starts_at} timeZone={record.time_zone} />
            ) : (
              <Box
                w="44px"
                h="44px"
                flexShrink={0}
                borderRadius="md"
                overflow="hidden"
                bg="bg.muted"
                display="grid"
                placeItems="center"
              >
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <KindDot kind={kind} boxSize="10px" />
                )}
              </Box>
            )
          }
          title={record.name}
          sub={
            record.search_match ? (
              <SearchMatch kind={kind} match={record.search_match} />
            ) : (
              describe(kind, record) || undefined
            )
          }
          end={<CountryCode code={record.location?.country_code} />}
        />
      );
    })}
  </RowList>
);

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
      <Page>
        <PageHeader
          title="Search"
          description="Find games, studios, associations and events by name, place, tag or studio, from the search box above."
        />
      </Page>
    );
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const current = KINDS.find((k) => k.kind === kind);

  return (
    <Page>
      <PageHeader title={`Results for “${q}”`} mb={4} />
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
            mb={{ base: 8, md: 10 }}
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
    </Page>
  );
};

export default SearchPage;
