import {
  Box,
  Flex,
  Grid,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import {
  LuBuilding2,
  LuCalendarDays,
  LuGamepad2,
  LuUsers,
} from 'react-icons/lu';
import { Link } from 'react-router';

import { CONTINENTS } from '../utils/countryTable';

// The countries as a periodic table (#258): each country a tile, its code
// as the symbol, its rank by scene size as the number, its studios,
// associations, games and events as tiny icons; tiles grouped and coloured
// by continent.

const PALETTES = {
  EU: 'blue',
  NA: 'orange',
  SA: 'green',
  AS: 'red',
  OC: 'cyan',
  AF: 'yellow',
  AN: 'gray',
};

const STATS = [
  ['studios', LuBuilding2, 'studio'],
  ['associations', LuUsers, 'association'],
  ['games', LuGamepad2, 'game'],
  ['events', LuCalendarDays, 'event'],
];

const plural = (n, one) =>
  `${n.toLocaleString('en')} ${one}${n === 1 ? '' : 's'}`;
const describe = (country) =>
  `${country.name}: ${STATS.map(([key, , one]) => plural(country[key], one)).join(', ')}`;

const Tile = ({ country }) => {
  const palette = PALETTES[country.continent] ?? 'gray';
  return (
    <LinkBox
      as="li"
      aspectRatio={1}
      p={2}
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderRadius="md"
      bg={`${palette}.subtle`}
      borderColor={`${palette}.muted`}
      transition="transform 120ms"
      _hover={{ transform: 'scale(1.06)', zIndex: 1, shadow: 'md' }}
      _focusWithin={{
        outline: '2px solid',
        outlineColor: `${palette}.solid`,
        outlineOffset: '2px',
      }}
    >
      <Flex
        justify="space-between"
        fontSize="2xs"
        color="fg.muted"
        lineHeight="1"
        aria-hidden
      >
        <span title="Rank by studios and associations">{country.rank}</span>
        <span title="Studios and associations">
          {country.studios + country.associations}
        </span>
      </Flex>
      <LinkOverlay asChild>
        <Link
          to={`/country/${country.code.toLowerCase()}`}
          aria-label={describe(country)}
        >
          <Text
            fontSize="2xl"
            fontWeight="800"
            lineHeight="1.1"
            mt={1}
            color={`${palette}.fg`}
          >
            {country.code}
          </Text>
        </Link>
      </LinkOverlay>
      <Text fontSize="xs" lineClamp={1} lineHeight="1.2" aria-hidden>
        {country.name}
      </Text>
      <Grid
        templateColumns="repeat(2, 1fr)"
        mt="auto"
        columnGap={1}
        fontSize="2xs"
        color="fg.muted"
        aria-hidden
      >
        {STATS.map(([key, icon]) => (
          <Flex
            key={key}
            align="center"
            gap="2px"
            opacity={country[key] ? 1 : 0.35}
          >
            <Icon as={icon} boxSize="10px" />
            {country[key].toLocaleString('en')}
          </Flex>
        ))}
      </Grid>
    </LinkBox>
  );
};

const CountriesTable = ({ countries }) => (
  <Box>
    <Flex
      gap={4}
      wrap="wrap"
      fontSize="sm"
      color="fg.muted"
      mb={4}
      align="center"
      aria-hidden
    >
      {CONTINENTS.filter(([code]) =>
        countries.some((c) => c.continent === code)
      ).map(([code, name]) => (
        <Flex key={code} align="center" gap={1}>
          <Box
            w="14px"
            h="14px"
            borderRadius="sm"
            borderWidth="1px"
            bg={`${PALETTES[code]}.subtle`}
            borderColor={`${PALETTES[code]}.muted`}
          />
          {name}
        </Flex>
      ))}
      <Flex gap={3} ml={{ md: 'auto' }} wrap="wrap">
        {STATS.map(([key, icon]) => (
          <Flex key={key} align="center" gap={1}>
            <Icon as={icon} boxSize="12px" /> {key}
          </Flex>
        ))}
      </Flex>
    </Flex>
    <Grid
      as="ul"
      listStyle="none"
      templateColumns="repeat(auto-fill, minmax(6.5rem, 1fr))"
      gap={2}
    >
      {countries.map((country) => (
        <Tile key={country.code} country={country} />
      ))}
    </Grid>
  </Box>
);

export default CountriesTable;
