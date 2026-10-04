import { Box, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { redirect, useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import countryNames from '../assets/countries.json';
import { pageMeta } from '../utils/meta';

export const loader = async ({ params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  const countryCode = params.code.toUpperCase();

  // using remix-i18n ?
  // let locale = await i18next.getLocale(request);

  // fetch country data and use right locale

  const cities = await db.$queryRaw`select city as name, count(e.id)::int from location l left join entity e on l.id = e.location_id where country_code = ${countryCode} and city is not null group by city order by count desc limit 10`;

  // country does not exist, or has no places yet
  if (cities.length === 0 || !countryNames[countryCode]) {
    throw new Response('Not Found', { status: 404 });
  }

  return {
    country: {
      code: countryCode,
      name: countryNames[countryCode],
      cities,
    },
  };
};

export const meta = ({ data, matches, location }) =>
  data?.country
    ? pageMeta(matches, {
        title: `${data.country.name} | Indie Collective - Community powered video game data`,
        description: `${data.country.name}'s game industry: its most active cities for indie game studios and associations.`,
        path: location.pathname,
      })
    : [{ title: 'Country not found' }];

const CountriesPage = () => {
  const { country } = useLoaderData();

  return (
    <Box my={5} px={5}>
      <Heading as="h2" size="xl" mb={8}>
        {country.name}'s Game Industry
      </Heading>
      <Heading as="h3" size="lg" mb={5}>
        Most vibrant cities
      </Heading>
      <SimpleGrid
        columns={{ base: 4, sm: 5, md: 6 }}
        gap={{ base: '5', md: '6' }}
      >
        {/* No per-city page exists yet, so cities aren't links. */}
        {country.cities.map(({ name, count }) => (
          <Box
            key={name}
            px={{ base: '4', md: '6' }}
            py={{ base: '5', md: '6' }}
            bg="bg-surface"
            borderRadius="lg"
            border="1px solid"
          >
            <Stack>
              <Text fontSize="sm">{name}</Text>
              <Heading size={{ base: 'md', md: 'lg' }}>{count}</Heading>
              <Text>{count === 1 ? 'structure' : 'structures'}</Text>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CountriesPage;
