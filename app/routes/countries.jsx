import {
  Box,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import PrototypeSwitcher from '../components/PrototypeSwitcher';
import CountriesPeriodicTable from '../components/CountriesPeriodicTable.prototype';

import { db } from '../utils/db.server';
import countryNames from '../assets/countries.json';
import continents from '../assets/continents.json';
import { pageMeta } from '../utils/meta';

// Every country with something placed in it, the biggest scenes first (#258).
export const loader = async () => {
  const [locations, gameLinks, events] = await Promise.all([
    db.location.findMany({
      select: { country_code: true, entity: { select: { type: true } } },
    }),
    // PROTOTYPE (periodic table): games made by each country's studios, and
    // events held there.
    db.game_entity.findMany({
      where: { game: { deleted: false } },
      select: {
        game_id: true,
        entity: { select: { location: { select: { country_code: true } } } },
      },
    }),
    db.event.findMany({
      select: { location: { select: { country_code: true } } },
    }),
  ]);
  const gamesBy = new Map();
  for (const { game_id, entity } of gameLinks) {
    const code = entity?.location?.country_code;
    if (!code) continue;
    gamesBy.set(code, (gamesBy.get(code) ?? new Set()).add(game_id));
  }
  const eventsBy = new Map();
  for (const { location } of events) {
    if (location) eventsBy.set(location.country_code, (eventsBy.get(location.country_code) ?? 0) + 1);
  }

  const byCountry = new Map();
  for (const { country_code: code, entity } of locations) {
    if (!countryNames[code]) continue;
    const country = byCountry.get(code) ?? {
      code,
      name: countryNames[code],
      studios: 0,
      associations: 0,
      games: gamesBy.get(code)?.size ?? 0,
      events: eventsBy.get(code) ?? 0,
      continent: continents[code] ?? null,
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
  // PROTOTYPE: ?variant=continent|size (periodic table) or list (#260).
  const [searchParams] = useSearchParams();
  const variant = searchParams.get('variant') ?? 'continent';

  return (
    <Box mb={5} px={5}>
      <Heading as="h2" size="2xl" my={5}>
        Countries
      </Heading>
      <PrototypeSwitcher
        variants={[
          ['continent', 'Periodic table, by continent'],
          ['size', 'Periodic table, by scene size'],
          ['list', '#260: list'],
        ]}
        current={variant}
      />
      {variant === 'list' ? (
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
      ) : (
        <CountriesPeriodicTable countries={countries} variant={variant} />
      )}
    </Box>
  );
};

export default CountriesPage;
