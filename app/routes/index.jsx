import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import { LuChevronRight, LuPlus, LuSearch } from 'react-icons/lu';

import { useId } from 'react';
import { Form, useLoaderData } from 'react-router';
import Link from '../components/Link';

import isAuthenticated from '../utils/isAuthenticated.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import PlacesWidget from '../components/PlacesWidget';
import { Page } from '../components/Page';
import Reveal from '../components/Reveal';
import StatStrip from '../components/kit/StatStrip';
import { Row, RowList } from '../components/kit/RowList';
import BarList from '../components/kit/BarList';
import DateBadge from '../components/kit/DateBadge';
import KindDot, { KIND_LABELS } from '../components/kit/KindDot';
import CountryCode from '../components/kit/CountryCode';
import countryNames from '../assets/countries.json';
import usePlaceholder from '../hooks/usePlaceholder';
import { pageMeta } from '../utils/meta';
import { formatEventDate } from '../utils/eventTime';
import { eventPath, orgPath } from '../utils/slug';
import {
  countEvents,
  listRecentEvents,
  listUpcomingEvents,
} from '../data/events.server';
import { countGames, listFeaturedGames } from '../data/games.server';
import {
  countOrganizations,
  countOrganizationsByCountry,
  listFeaturedOrganizations,
  listOrganizationPoints,
  listRecentOrganizations,
} from '../data/organizations.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  const [
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    recentEvents,
    recentOrgs,
    byCountry,
    placesPoints,
    gamesCount,
    studiosCount,
    associationsCount,
    eventsCount,
  ] = await Promise.all([
    // #199: complete entries, recently updated, rather than the newest.
    listFeaturedGames({ limit: 6 }),
    listFeaturedOrganizations({ type: 'association', limit: 4 }),
    listFeaturedOrganizations({ type: 'studio', limit: 4 }),
    listUpcomingEvents({ limit: 4 }),
    currentUser
      ? listUpcomingEvents({ limit: 3, attendeeId: currentUser.id })
      : [],
    listRecentEvents({ limit: 3 }),
    listRecentOrganizations({ limit: 5 }),
    countOrganizationsByCountry({ limit: 5 }),
    listOrganizationPoints(),
    countGames(),
    countOrganizations({ type: 'studio' }),
    countOrganizations({ type: 'association' }),
    countEvents(),
  ]);

  return {
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    recentEvents,
    recentOrgs,
    byCountry,
    placesCount: placesPoints.length,
    placesPoints,
    counts: {
      games: gamesCount,
      studios: studiosCount,
      associations: associationsCount,
      events: eventsCount,
    },
    currentUser,
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie Collective - Community powered video game data',
    description:
      'The indie game scene, mapped by its community: studios, associations, games and events from around the world, in an open database anyone can add to.',
    path: location.pathname,
  });

const ADD_LINKS = [
  ['/games/create', 'Add a game'],
  ['/orgs/create', 'Add a studio or association'],
  ['/events/create', 'Add an event'],
];

// #200: what the site is, search, and an invitation to add to it. Only for
// people who aren't signed in: members know.
const Hero = ({ countries }) => (
  <Box
    mb={6}
    px={[5, 8]}
    py={[6, 8]}
    borderRadius="2xl"
    bg={{ base: 'green.50', _dark: 'green.950' }}
  >
    <Heading as="h1" size={['2xl', '3xl']} mb={3} maxW="2xl">
      The indie game scene, mapped by its community
    </Heading>
    <Text fontSize={['md', 'lg']} mb={5} maxW="2xl">
      Studios, associations, games and events from {countries} countries, in an
      open database anyone can add to.
    </Text>

    <Form method="get" action="/search" role="search">
      <HStack maxW="xl" mb={5}>
        <Input
          name="q"
          size="lg"
          bg={{ base: 'white', _dark: 'gray.900' }}
          placeholder="Find a game, studio, association or event"
          aria-label="Search"
        />
        <Button type="submit" size="lg" colorPalette="green">
          <LuSearch />
          Search
        </Button>
      </HStack>
    </Form>

    <Stack direction={['column', 'row']} gap={2} align={['stretch', 'center']}>
      <Text fontWeight="semibold" mr={2}>
        Know one we're missing?
      </Text>
      {ADD_LINKS.map(([to, label]) => (
        <Button key={to} variant="outline" size="sm" asChild>
          <Link to={to}>
            <LuPlus />
            {label}
          </Link>
        </Button>
      ))}
    </Stack>
    <Text fontSize="sm" color="muted" mt={3}>
      Adding needs a free account: sign in with Bluesky.
    </Text>
  </Box>
);

// A homepage section: a heading, a link to the full list, and its content.
const Section = ({ title, to, linkLabel, children, ...rest }) => {
  // Labelled by its heading: a region screen readers can jump to.
  const headingId = useId();
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      minW={0}
      mb={{ base: 8, md: 10 }}
      {...rest}
    >
      <Flex justify="space-between" align="baseline" gap={3} mb={4} wrap="wrap">
        <Heading as="h2" id={headingId} size="xl">
          {title}
        </Heading>
        {to && (
          <Button colorPalette="gray" variant="ghost" size="sm" asChild>
            <Link to={to}>
              {linkLabel}
              <LuChevronRight />
            </Link>
          </Button>
        )}
      </Flex>
      <Reveal>{children}</Reveal>
    </Box>
  );
};

const place = (location) =>
  location &&
  [location.city, countryNames[location.country_code]]
    .filter(Boolean)
    .join(', ');

// The next event, large: cover, date, place, who's going.
const NextEvent = ({ event }) => {
  const placeholder = usePlaceholder();
  const going = event.event_participant?.length ?? 0;
  return (
    <Box
      asChild
      display="grid"
      gridTemplateColumns={{
        base: '1fr',
        sm: 'minmax(0, 1.1fr) minmax(0, 1fr)',
      }}
      bg="surface"
      borderRadius="xl"
      shadow="xs"
      overflow="hidden"
      transition="transform 160ms ease-out, box-shadow 160ms ease-out"
      _hover={{ transform: 'translateY(-2px)', shadow: 'sm' }}
    >
      <Link to={eventPath(event)}>
        <AspectRatio ratio={2}>
          <Image
            src={event.cover?.url ?? placeholder}
            alt=""
            objectFit="cover"
          />
        </AspectRatio>
        <Stack gap={2} p={4} justify="center">
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="wide"
            color="kind.event"
          >
            Next up
          </Text>
          <Heading as="h3" size="lg">
            {event.name}
          </Heading>
          <Text color="muted" fontSize="sm">
            <time dateTime={new Date(event.starts_at).toISOString()}>
              {formatEventDate(event.starts_at, event.time_zone)}
            </time>
            {event.location && <> · {place(event.location)}</>}
          </Text>
          {going > 0 && (
            <Text fontSize="sm" color="muted">
              {going} {going === 1 ? 'member' : 'members'} going
            </Text>
          )}
        </Stack>
      </Link>
    </Box>
  );
};

const EventRow = ({ event, sub }) => (
  <Row
    to={eventPath(event)}
    start={<DateBadge value={event.starts_at} timeZone={event.time_zone} />}
    title={event.name}
    sub={sub ?? place(event.location)}
    end={<CountryCode code={event.location?.country_code} />}
  />
);

const year = (date) => new Date(date).getUTCFullYear();

const EventGrid = ({ events }) => (
  <Grid gap={3} templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
    {events.map((event) => (
      <Box key={event.id} minW={0}>
        <EventCard {...event} />
      </Box>
    ))}
  </Grid>
);

const HomePage = () => {
  const {
    games,
    studios,
    associations,
    eventsToCome,
    joinedEventsToCome,
    recentEvents,
    recentOrgs,
    byCountry,
    placesCount,
    placesPoints,
    counts,
    currentUser,
  } = useLoaderData();
  const [next, ...laterEvents] = eventsToCome;

  return (
    <Page>
      {currentUser ? (
        <VisuallyHidden asChild>
          <h1>Indie Collective Community</h1>
        </VisuallyHidden>
      ) : (
        <Hero countries={byCountry.countries} />
      )}

      {/* What's here, each count a way in (design pass). */}
      <StatStrip
        mb={{ base: 8, md: 10 }}
        aria-label="What's in the database"
        items={[
          { value: counts.games, label: 'games', kind: 'game', to: '/games' },
          {
            value: counts.studios,
            label: 'studios',
            kind: 'studio',
            to: '/studios',
          },
          {
            value: counts.associations,
            label: 'associations',
            kind: 'association',
            to: '/associations',
          },
          {
            value: counts.events,
            label: 'events',
            kind: 'event',
            to: '/events',
          },
        ]}
      />

      {joinedEventsToCome.length > 0 && (
        <Section title="Your next events" to="/events" linkLabel="All events">
          <EventGrid events={joinedEventsToCome} />
        </Section>
      )}

      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }}
        columnGap={8}
      >
        <Box minW={0}>
          <Section
            title="Events"
            to="/events"
            linkLabel={`All ${counts.events.toLocaleString('en')} events`}
          >
            <Stack gap={3}>
              {next ? (
                <NextEvent event={next} />
              ) : (
                <Text color="muted">No upcoming events yet.</Text>
              )}
              {laterEvents.length > 0 && (
                <RowList aria-label="Also coming up">
                  {laterEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </RowList>
              )}
              {recentEvents.length > 0 && (
                <>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="muted"
                    mt={2}
                  >
                    Recently
                  </Text>
                  <RowList aria-label="Recent events">
                    {recentEvents.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        sub={[event.location?.city, year(event.starts_at)]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                    ))}
                  </RowList>
                </>
              )}
            </Stack>
          </Section>

          <Section
            title="Games"
            to="/games"
            linkLabel={`All ${counts.games.toLocaleString('en')} games`}
          >
            <Grid
              gap={2}
              templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
            >
              {games.map((game) => (
                <Box key={game.id} minW={0}>
                  <GameCard {...game} />
                </Box>
              ))}
            </Grid>
          </Section>
        </Box>

        <Box minW={0}>
          <Section
            title="Where the scene is"
            to="/countries"
            linkLabel="Countries"
          >
            <Box bg="surface" borderRadius="xl" shadow="xs" p={4} mb={4}>
              <BarList
                aria-label="Studios and associations per country"
                labelWidth="2.6em"
                rows={byCountry.top.map(({ country_code, count }) => ({
                  key: country_code,
                  to: `/country/${country_code.toLowerCase()}`,
                  label: <CountryCode code={country_code} />,
                  parts: [{ value: count, color: 'green.500' }],
                }))}
              />
              <Text fontSize="xs" color="muted" mt={3}>
                Studios and associations per country, top {byCountry.top.length}{' '}
                of {byCountry.countries}.
              </Text>
            </Box>
            <PlacesWidget
              placesCount={placesCount}
              placesPoints={placesPoints}
            />
          </Section>

          <Section title="Just added">
            <RowList>
              {recentOrgs.map((org) => (
                <Row
                  key={org.id}
                  to={orgPath(org)}
                  start={<KindDot kind={org.type} />}
                  title={org.name}
                  sub={[KIND_LABELS[org.type], org.location?.city]
                    .filter(Boolean)
                    .join(' · ')}
                  end={<CountryCode code={org.location?.country_code} />}
                />
              ))}
            </RowList>
          </Section>

          {currentUser && (
            <Box
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="green.400"
              bg={{ base: 'green.50', _dark: 'green.950' }}
              borderRadius="xl"
              p={4}
              mb={{ base: 8, md: 10 }}
            >
              <Text fontWeight="semibold" mb={3}>
                Add to Community
              </Text>
              <Flex gap={2} wrap="wrap">
                {ADD_LINKS.map(([to, label]) => (
                  <Button
                    key={to}
                    variant="outline"
                    size="sm"
                    bg="surface"
                    asChild
                  >
                    <Link to={to}>
                      <LuPlus />
                      {label}
                    </Link>
                  </Button>
                ))}
              </Flex>
            </Box>
          )}
        </Box>
      </Grid>

      {/* minW 0: grid items otherwise can't shrink below their content,
          which pushed the page past a 375px screen. */}
      <Grid gap={8} templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}>
        <Section
          title="Studios"
          to="/studios"
          linkLabel={`All ${counts.studios.toLocaleString('en')} studios`}
        >
          <Grid gap={3} templateColumns={['1fr', 'repeat(2, 1fr)']}>
            {studios.map((studio) => (
              <Box key={studio.id} minW={0}>
                <OrgCard {...studio} />
              </Box>
            ))}
          </Grid>
        </Section>
        <Section
          title="Associations"
          to="/associations"
          linkLabel={`All ${counts.associations.toLocaleString('en')} associations`}
        >
          <Grid gap={3} templateColumns={['1fr', 'repeat(2, 1fr)']}>
            {associations.map((association) => (
              <Box key={association.id} minW={0}>
                <OrgCard {...association} />
              </Box>
            ))}
          </Grid>
        </Section>
      </Grid>
    </Page>
  );
};

export default HomePage;
