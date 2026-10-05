import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Link, useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import countryNames from '../assets/countries.json';
import { pageMeta } from '../utils/meta';

// Every country with something placed in it, the biggest scenes first (#258).
export const loader = async () => {
  const locations = await db.location.findMany({
    select: { country_code: true, entity: { select: { type: true } } },
  });

  const byCountry = new Map();
  for (const { country_code: code, entity } of locations) {
    if (!countryNames[code]) continue;
    const country = byCountry.get(code) ?? {
      code,
      name: countryNames[code],
      studios: 0,
      associations: 0,
    };
    for (const { type } of entity) {
      if (type === 'studio') country.studios += 1;
      if (type === 'association') country.associations += 1;
    }
    byCountry.set(code, country);
  }

  return {
    countries: [...byCountry.values()].sort(
      (a, b) =>
        b.studios + b.associations - (a.studios + a.associations) ||
        a.name.localeCompare(b.name)
    ),
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie game scenes, country by country',
    description:
      'Indie game studios and associations, country by country: where they are, the games they make and their upcoming events.',
    path: location.pathname,
  });

const plural = (n, one, many = `${one}s`) =>
  `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

const CountriesPage = () => {
  const { countries } = useLoaderData();

  return (
    <Box mb={5} px={5}>
      <Heading as="h2" size="2xl" my={5}>
        Countries
      </Heading>
      <SimpleGrid as="ul" listStyle="none" minChildWidth="12rem" gap={3}>
        {countries.map((country) => (
          <LinkBox
            as="li"
            key={country.code}
            p={4}
            bg="bg.panel"
            borderRadius="lg"
            borderWidth="1px"
            _hover={{ borderColor: 'border.emphasized' }}
          >
            <LinkOverlay asChild>
              <Link to={`/country/${country.code.toLowerCase()}`}>
                <Heading as="h3" size="md">
                  {country.name}
                </Heading>
              </Link>
            </LinkOverlay>
            <Text color="fg.muted" fontSize="sm" mt={1}>
              {[
                country.studios > 0 && plural(country.studios, 'studio'),
                country.associations > 0 &&
                  plural(country.associations, 'association'),
              ]
                .filter(Boolean)
                .join(' · ') || 'Events only'}
            </Text>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CountriesPage;
