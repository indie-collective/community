import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Link as ChakraLink,
  List,
  Text,
} from '@chakra-ui/react';
import { Link, redirect, useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import getImageLinks from '../utils/imageLinks.server';
import countryNames from '../assets/countries.json';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import EventCard from '../components/EventCard';
import EmptyHint from '../components/EmptyHint';
import { pageMeta } from '../utils/meta';
import { orgPoints, topCities } from '../utils/countryOverview';
import countryMaps from '../assets/countryMaps.json';
import CountryRegionMap from '../components/CountryRegionMap';

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

  const [orgs, upcomingEvents, currentUser] = await Promise.all([
    db.entity.findMany({
      where: { location: { country_code: countryCode } },
      select: {
        location: {
          select: { city: true, region: true, latitude: true, longitude: true },
        },
      },
    }),
    db.event.findMany({
      where: {
        status: { not: 'canceled' },
        ends_at: { gte: new Date() },
        location: { country_code: countryCode },
      },
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

  return {
    country: {
      code: countryCode,
      name: countryNames[countryCode],
      cities: topCities(orgs.map(({ location }) => location)),
      // The region map is drawn in the browser, from these points.
      points: countryMaps.includes(countryCode)
        ? orgPoints(orgs.map(({ location }) => location))
        : null,
      upcomingEvents: upcomingEvents.map((event) => ({
        ...event,
        cover: event.cover ? getImageLinks(event.cover) : null,
      })),
    },
    currentUser,
  };
};

export const meta = ({ data, matches, location }) =>
  data?.country
    ? pageMeta(matches, {
        title: `${data.country.name} | Indie Collective - Community powered video game data`,
        description: `${data.country.name}'s game industry: its most active cities for indie game studios and associations, and its upcoming events.`,
        path: location.pathname,
      })
    : [{ title: 'Country not found' }];

const CountriesPage = () => {
  const { country, currentUser } = useLoaderData();
  const { code, name, cities, points, upcomingEvents } = country;
  const most = cities[0]?.count ?? 0;

  return (
    <Box my={5} px={5}>
      <Heading as="h2" size="xl" mb={8}>
        {name}'s Game Industry
      </Heading>

      <Grid
        templateColumns={{
          base: '1fr',
          lg: points?.length
            ? 'minmax(0, 2fr) minmax(0, 3fr)'
            : 'minmax(0, 40rem)',
        }}
        gap={10}
        mb={10}
      >
        <Box as="section">
          <Heading as="h3" size="lg" mb={5}>
            Most vibrant cities
          </Heading>
          {cities.length > 0 ? (
            // No per-city page exists yet, so cities aren't links.
            <List.Root listStyle="none" gap={3}>
              {cities.map(({ name: city, region, count }) => (
                <List.Item key={city} display="block">
                  <Flex justify="space-between" gap={3}>
                    <Text fontWeight="semibold" lineClamp={1}>
                      {city}
                      {region && region !== city && (
                        <Text as="span" fontWeight="normal" color="fg.muted">
                          , {region}
                        </Text>
                      )}
                    </Text>
                    <Text whiteSpace="nowrap">
                      {count} {count === 1 ? 'structure' : 'structures'}
                    </Text>
                  </Flex>
                  <Box
                    aria-hidden
                    mt={1}
                    h="8px"
                    borderRadius="full"
                    bg="green.solid"
                    w={`${Math.max((count / most) * 100, 2)}%`}
                  />
                </List.Item>
              ))}
            </List.Root>
          ) : (
            <Text color="fg.muted">No studios or associations here yet.</Text>
          )}
        </Box>

        {points?.length > 0 && (
          <CountryRegionMap code={code} name={name} points={points} />
        )}
      </Grid>

      <Box as="section">
        <Flex
          align="baseline"
          justify="space-between"
          gap={3}
          mb={5}
          wrap="wrap"
        >
          <Heading as="h3" size="lg">
            Upcoming events
          </Heading>
          <ChakraLink asChild textDecoration="underline">
            <Link to={`/events?country=${code}`}>All events in {name}</Link>
          </ChakraLink>
        </Flex>
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
                Know one?{' '}
                <ChakraLink asChild textDecoration="underline">
                  <Link to="/events/create">Add an event</Link>
                </ChakraLink>
                .
              </EmptyHint>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default CountriesPage;
