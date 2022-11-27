import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';

export const loader = async () => {
  const data = {
    countries:
      await db.$queryRaw`select country_code, count(e.id)::int from indieco.location l left join indieco.entity e on l.id = e.location_id group by country_code order by count desc;`,
  };

  console.log('data', data);

  return json(data);
};

export const meta = () => ({
  title: 'Countries | Indie Collective - Community powered video game data',
});

const CountriesPage = () => {
  const { countries } = useLoaderData();

  return (
    <Box mb={5} px={5}>
      <Heading as="h3" size="xl" mb={5}>
        Countries
      </Heading>

      <SimpleGrid
        columns={{ base: 4, sm: 5, md: 6 }}
        gap={{ base: '5', md: '6' }}
      >
        {countries.map(({ country_code, count }) => (
          <LinkBox
            px={{ base: '4', md: '6' }}
            py={{ base: '5', md: '6' }}
            bg="bg-surface"
            borderRadius="lg"
            border="1px solid"
          >
            <Stack>
              <LinkOverlay as={Link} to={`/country/${country_code.toLowerCase()}`}>
                <Text fontSize="sm">{country_code}</Text>
              </LinkOverlay>
              <Heading size={{ base: 'md', md: 'lg' }}>{count}</Heading>
            </Stack>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CountriesPage;
