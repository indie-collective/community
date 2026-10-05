import {
  Box,
  Flex,
  Grid,
  Heading,
  Image,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link, redirect, useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import getImageLinks from '../utils/imageLinks.server';
import countryNames from '../assets/countries.json';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import computeGame from '../models/game';
import EventCard from '../components/EventCard';
import GameCard from '../components/GameCard';
import EmptyHint from '../components/EmptyHint';
import { pageMeta } from '../utils/meta';
import { associationsByCity, citiesOf } from '../utils/countryOverview';
import countryMaps from '../assets/countryMaps.json';
import CountryMap from '../components/CountryMap';
import CityList from '../components/CityList';

// A country page is the overview of its indie scene, for newcomers and
// peers, and for search (#258). /places is for exploring on a map.
export const loader = async ({ request, params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  const countryCode = params.code.toUpperCase();

  // A country exists here once something is placed in it.
  const places = countryNames[countryCode]
    ? await db.location.count({ where: { country_code: countryCode } })
    : 0;
  if (places === 0) {
    throw new Response('Not Found', { status: 404 });
  }

  const inCountry = { location: { country_code: countryCode } };
  const gamesMadeHere = {
    deleted: false,
    game_entity: { some: { entity: inCountry } },
  };
  const upcoming = {
    ...inCountry,
    status: { not: 'canceled' },
    ends_at: { gte: new Date() },
  };

  const [
    orgs,
    gameCount,
    recentGames,
    eventCount,
    upcomingEvents,
    currentUser,
  ] = await Promise.all([
    db.entity.findMany({
      where: inCountry,
      select: {
        id: true,
        name: true,
        type: true,
        location: {
          select: { city: true, region: true, latitude: true, longitude: true },
        },
      },
    }),
    db.game.count({ where: gamesMadeHere }),
    db.game.findMany({
      where: gamesMadeHere,
      orderBy: [{ created_at: 'desc' }, { id: 'asc' }],
      take: 8,
      include: {
        game_image: { include: { image: true } },
        game_tag: { include: { tag: true } },
        game_entity: { include: { entity: true } },
      },
    }),
    db.event.count({ where: upcoming }),
    db.event.findMany({
      where: upcoming,
      include: {
        event_participant: true,
        game_event: { where: { game: { deleted: false } } },
        location: true,
        cover: true,
      },
      orderBy: { starts_at: 'asc' },
      take: 3,
    }),
    isAuthenticated(request),
  ]);

  const associations = orgs.filter((org) => org.type === 'association');
  const cities = citiesOf(orgs);

  return {
    country: {
      code: countryCode,
      name: countryNames[countryCode],
      counts: {
        studios: orgs.filter((org) => org.type === 'studio').length,
        associations: associations.length,
        games: gameCount,
        events: eventCount,
        cities: cities.length,
      },
      cities,
      hasMap: countryMaps.includes(countryCode),
      associations: associationsByCity(associations).map(
        ({ city, associations: list }) => ({
          city,
          associations: list.map(({ id, name }) => ({ id, name })),
        })
      ),
      recentGames: await Promise.all(recentGames.map(computeGame)),
      upcomingEvents: upcomingEvents.map((event) => ({
        ...event,
        cover: event.cover ? getImageLinks(event.cover) : null,
      })),
    },
    currentUser,
  };
};

const plural = (n, one, many = `${one}s`) =>
  `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

export const meta = ({ data, matches, location }) => {
  if (!data?.country) return [{ title: 'Country not found' }];
  const { name, counts } = data.country;
  return pageMeta(matches, {
    title: `Indie game studios and associations in ${name}`,
    description: `${name}'s indie game scene: ${plural(counts.studios, 'studio')} and ${plural(
      counts.associations,
      'association'
    )} in ${plural(counts.cities, 'city', 'cities')}, ${plural(counts.games, 'game')} made there, and its upcoming events.`,
    path: location.pathname,
  });
};

const Section = ({ title, action, children, ...rest }) => (
  <Box as="section" mb={12} {...rest}>
    <Flex align="baseline" justify="space-between" gap={3} mb={5} wrap="wrap">
      <Heading as="h3" size="lg">
        {title}
      </Heading>
      {action}
    </Flex>
    {children}
  </Box>
);

const MoreLink = ({ to, children }) => (
  <ChakraLink asChild textDecoration="underline">
    <Link to={to}>{children}</Link>
  </ChakraLink>
);

// Associations are listed for the cities with the most first; the rest fold.
const FIRST_CITIES = 12;

const AssociationGroups = ({ groups }) => (
  <Grid
    templateColumns="repeat(auto-fill, minmax(min(100%, 10rem), 1fr))"
    columnGap={8}
    rowGap={5}
  >
    {groups.map(({ city, associations: list }) => (
      <Box key={city ?? '—'}>
        <Text fontWeight="semibold" mb={1}>
          {city ?? 'Elsewhere'}
        </Text>
        <Stack as="ul" listStyle="none" gap={0.5}>
          {list.map((association) => (
            <li key={association.id}>
              <ChakraLink asChild>
                <Link to={`/org/${association.id}`}>{association.name}</Link>
              </ChakraLink>
            </li>
          ))}
        </Stack>
      </Box>
    ))}
  </Grid>
);

const CountryPage = () => {
  const { country, currentUser } = useLoaderData();
  const {
    code,
    name,
    counts,
    cities,
    hasMap,
    associations,
    recentGames,
    upcomingEvents,
  } = country;

  const stats = [
    [counts.studios, 'studio', 'studios', `/studios?country=${code}`],
    [
      counts.associations,
      'association',
      'associations',
      `/associations?country=${code}`,
    ],
    [counts.games, 'game', 'games', `/games?country=${code}`],
    [
      counts.events,
      'upcoming event',
      'upcoming events',
      `/events?country=${code}`,
    ],
  ];

  return (
    <Box my={5} px={5}>
      <Heading as="h2" size="2xl" mb={6}>
        {name}'s indie game scene
      </Heading>

      <SimpleGrid
        as="ul"
        listStyle="none"
        columns={{ base: 2, md: 4 }}
        gap={3}
        mb={12}
      >
        {stats.map(([value, one, many, to]) => (
          <Box as="li" key={many}>
            <ChakraLink
              asChild
              display="block"
              h="100%"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              bg="bg.panel"
              _hover={{
                textDecoration: 'none',
                borderColor: 'border.emphasized',
              }}
            >
              <Link to={to}>
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                  {value.toLocaleString('en')}
                </Text>
                <Text color="fg.muted" mt={1}>
                  {value === 1 ? one : many}
                </Text>
              </Link>
            </ChakraLink>
          </Box>
        ))}
      </SimpleGrid>

      {hasMap && cities.some((city) => city.lat != null) ? (
        <Section title={`Where ${name}'s scene is`}>
          <CountryMap code={code} name={name} cities={cities} />
        </Section>
      ) : (
        <Section title="Cities">
          <CityList cities={cities} />
        </Section>
      )}

      <Section
        title="Associations"
        action={
          counts.associations > 0 && (
            <MoreLink to={`/associations?country=${code}`}>
              All associations in {name}
            </MoreLink>
          )
        }
      >
        {associations.length > 0 ? (
          <>
            <AssociationGroups groups={associations.slice(0, FIRST_CITIES)} />
            {associations.length > FIRST_CITIES && (
              // Still in the HTML, for search; only folded away on screen.
              <Box as="details" mt={5}>
                <Box as="summary" cursor="pointer" textDecoration="underline">
                  Show associations in{' '}
                  {plural(
                    associations.length - FIRST_CITIES,
                    'more city',
                    'more cities'
                  )}
                </Box>
                <Box mt={5}>
                  <AssociationGroups
                    groups={associations.slice(FIRST_CITIES)}
                  />
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Stack gap={2}>
            <Text color="fg.muted">No associations in {name} yet.</Text>
            {currentUser && (
              <EmptyHint alignSelf="flex-start">
                Know one?{' '}
                <MoreLink to="/orgs/create?type=association">
                  Add an association
                </MoreLink>
                .
              </EmptyHint>
            )}
          </Stack>
        )}
      </Section>

      {recentGames.length > 0 && (
        <Section
          title={`Games made in ${name}`}
          action={
            <MoreLink to={`/games?country=${code}`}>
              All {plural(counts.games, 'game')}
            </MoreLink>
          }
        >
          <Grid
            gap={3}
            templateColumns={[
              'repeat(2, 1fr)',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
          >
            {recentGames.map((game) => (
              <Box minW={0} key={game.id}>
                <GameCard {...game} />
              </Box>
            ))}
          </Grid>
        </Section>
      )}

      <Section
        title="Upcoming events"
        action={
          <MoreLink to={`/events?country=${code}`}>
            All events in {name}
          </MoreLink>
        }
      >
        {upcomingEvents.length > 0 ? (
          <Grid
            gap={3}
            templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
          >
            {upcomingEvents.map((event) => (
              <Box minW={0} key={event.id}>
                <EventCard {...event} />
              </Box>
            ))}
          </Grid>
        ) : (
          <Flex direction="column" align="center" gap={4} py={5}>
            <Image src={noEventsImage} alt="" maxW="16rem" />
            <Text fontSize="lg">No upcoming events in {name}.</Text>
            {currentUser && (
              <EmptyHint>
                Know one? <MoreLink to="/events/create">Add an event</MoreLink>.
              </EmptyHint>
            )}
          </Flex>
        )}
      </Section>
    </Box>
  );
};

export default CountryPage;
