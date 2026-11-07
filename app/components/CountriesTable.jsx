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
import Link from './Link';

import { CONTINENTS } from '../utils/countryTable';

// The countries as a periodic table (#258): each country a tile, its code
// as the symbol, its rank by scene size as the number, its studios,
// associations, games and events as tiny icons; tiles grouped and coloured
// by continent.

// A continent's tile colour: a soft paper tint from the theme.
const KNOWN = new Set(CONTINENTS.map(([code]) => code));
const tint = (continent) => `continent.${KNOWN.has(continent) ? continent : 'AN'}`;

const STATS = [
  ['studios', LuBuilding2, 'studio'],
  ['associations', LuUsers, 'association'],
  ['games', LuGamepad2, 'game'],
  ['events', LuCalendarDays, 'event'],
];

const plural = (n, one) =>
  `${n.toLocaleString('en')} ${one}${n === 1 ? '' : 's'}`;
// Starting with the code the tile shows, so the link's name includes its
// visible text (#350, WCAG 2.5.3).
const describe = (country) =>
  `${country.code}, ${country.name}: ${STATS.map(([key, , one]) => plural(country[key], one)).join(', ')}`;

const Tile = ({ country }) => {
  return (
    <LinkBox
      as="li"
      aspectRatio={1}
      p={2}
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderRadius="label"
      bg={tint(country.continent)}
      borderColor="rule"
      transition="transform 120ms"
      _hover={{ transform: 'scale(1.06)', zIndex: 1, shadow: 'raisedHover' }}
      _focusWithin={{
        outline: '2px solid',
        outlineColor: 'ink',
        outlineOffset: '2px',
      }}
    >
      <Flex
        justify="space-between"
        fontSize="2xs"
        color="muted"
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
            fontWeight="600"
            lineHeight="1.1"
            mt={1}
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
        color="muted"
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
      color="muted"
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
            borderRadius="label"
            borderWidth="1px"
            bg={tint(code)}
            borderColor="rule"
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
