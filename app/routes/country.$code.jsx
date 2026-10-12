import {
  Box,
  Flex,
  Grid,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { redirect, useLoaderData } from 'react-router';
import Link from '../components/Link';

import { countPlaces, getCountryOverview } from '../data/countries.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import countryNames from '../assets/countries.json';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { Page, PageHeader, PageSection } from '../components/Page';
import StatStrip from '../components/kit/StatStrip';
import EventCard from '../components/EventCard';
import GameCard from '../components/GameCard';
import EmptyHint from '../components/EmptyHint';
import { pageMeta } from '../utils/meta';
import { associationsByCity, citiesOf } from '../utils/countryOverview';
import countryMaps from '../assets/countryMaps.json';
import CountryMap from '../components/CountryMap';
import CityList from '../components/CityList';
import { orgPath } from '../utils/slug';

// A country page is the overview of its indie scene, for newcomers and
// peers, and for search (#258). /places is for exploring on a map.
export const loader = async ({ request, params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  const countryCode = params.code.toUpperCase();

  // A country exists here once something is placed in it.
  const places = countryNames[countryCode] ? await countPlaces(countryCode) : 0;
  if (places === 0) {
    throw new Response('Not Found', { status: 404 });
  }

  const [
    { orgs, gameCount, recentGames, eventCount, upcomingEvents },
    currentUser,
  ] = await Promise.all([
    getCountryOverview(countryCode),
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
      recentGames,
      upcomingEvents,
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

// The page's sections, as on every page (design pass).
const Section = ({ action, ...rest }) => (
  <PageSection aside={action} {...rest} />
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
                <Link to={orgPath(association)}>{association.name}</Link>
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

  return (
    <Page>
      <PageHeader
        eyebrow={
          <HStack gap={2}>
            <Link to="/countries">Countries</Link>
            <Text as="span" aria-hidden>
              /
            </Text>
            <span>Country</span>
          </HStack>
        }
        title={`${name}'s indie game scene`}
      />

      {/* The scene's numbers, each a way into its list (design pass). */}
      <StatStrip
        mb={12}
        aria-label={`${name} on Community`}
        items={[
          {
            value: counts.studios,
            label: counts.studios === 1 ? 'studio' : 'studios',
            kind: 'studio',
            to: `/studios?country=${code}`,
          },
          {
            value: counts.associations,
            label: counts.associations === 1 ? 'association' : 'associations',
            kind: 'association',
            to: `/associations?country=${code}`,
          },
          {
            value: cities.length,
            label: cities.length === 1 ? 'city' : 'cities',
          },
          {
            value: counts.games,
            label: counts.games === 1 ? 'game' : 'games',
            kind: 'game',
            to: `/games?country=${code}`,
          },
          {
            value: counts.events,
            label: counts.events === 1 ? 'upcoming event' : 'upcoming events',
            kind: 'event',
            to: `/events?country=${code}`,
          },
        ]}
      />

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
            <Text color="muted">No associations in {name} yet.</Text>
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
    </Page>
  );
};

export default CountryPage;
