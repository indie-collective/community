import { Box, Heading, Text } from '@chakra-ui/react';
import { useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import countryNames from '../assets/countries.json';
import continents from '../assets/continents.json';
import { countryTable } from '../utils/countryTable';
import CountriesTable from '../components/CountriesTable';
import { pageMeta } from '../utils/meta';

// Every country with something placed in it, as a periodic table (#258).
export const loader = async () => {
  const [locations, gameLinks, events] = await Promise.all([
    db.location.findMany({
      select: { country_code: true, entity: { select: { type: true } } },
    }),
    // Games made by each country's studios.
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

  return {
    countries: countryTable({
      locations,
      gameLinks,
      events,
      names: countryNames,
      continents,
    }),
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie game scenes, country by country',
    description:
      'Indie game studios and associations, country by country: where they are, the games they make and their events.',
    path: location.pathname,
  });

const CountriesPage = () => {
  const { countries } = useLoaderData();

  return (
    <Box mb={5} px={5}>
      <Heading as="h2" size="2xl" mt={5} mb={2}>
        Countries
      </Heading>
      <Text color="fg.muted" mb={5}>
        Every country with indie game studios, associations or events, by
        continent. The number is its rank by studios and associations.
      </Text>
      <CountriesTable countries={countries} />
    </Box>
  );
};

export default CountriesPage;
