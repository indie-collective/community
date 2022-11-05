import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';

export const loader = async ({ params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  // using remix-i18n ?
  // let locale = await i18next.getLocale(request);

  // fetch country data and use right locale

  const cities =
    await db.$queryRaw`select city as name, count(e.id)::int from indieco.location l left join indieco.entity e on l.id = e.location_id where country_code = ${params.code.toUpperCase()} group by city order by count desc limit 10`;

  // country does not exist
  if (cities.length === 0) {
    return json(
      {
        error: 'Country not found',
      },
      404
    );
  }

  console.log(cities);

  const data = {
    country: {
      name: params.code,
      cities,
    },
  };

  return json(data);
};

export const meta = ({ data: { country } }) => ({
  title: `${country.name} | Indie Collective - Community powered video game data`,
});

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
        {country.cities.map(({ name, count }) => (
          <LinkBox
            px={{ base: '4', md: '6' }}
            py={{ base: '5', md: '6' }}
            bg="bg-surface"
            borderRadius="lg"
            border="1px solid"
          >
            <Stack>
              <LinkOverlay as={Link} to={`/city/${name.toLowerCase()}`}>
                <Text fontSize="sm">{name}</Text>
              </LinkOverlay>
              <Heading size={{ base: 'md', md: 'lg' }}>{count}</Heading>
              <Text>stuctures</Text>
            </Stack>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CountriesPage;
