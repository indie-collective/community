// PROTOTYPE (#258): /countries as a periodic table. Each country is a tile
// with its code as the "symbol", its rank as the "number", and tiny icons
// for its studios, associations, games and events. Throwaway; lives on
// chore/prototype-annotated-map.
//   ?variant=continent: tiles grouped and coloured by continent.
//   ?variant=size: tiles coloured by how big the scene is.
import { Box, Flex, Grid, Icon, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { LuBuilding2, LuCalendarDays, LuGamepad2, LuUsers } from 'react-icons/lu';
import { Link } from 'react-router';

const CONTINENTS = [
  ['EU', 'Europe', 'blue'],
  ['NA', 'North America', 'orange'],
  ['SA', 'South America', 'green'],
  ['AS', 'Asia', 'red'],
  ['OC', 'Oceania', 'cyan'],
  ['AF', 'Africa', 'yellow'],
  ['AN', 'Antarctica', 'gray'],
];
const PALETTE = Object.fromEntries(CONTINENTS.map(([code, , palette]) => [code, palette]));

const STATS = [
  ['studios', LuBuilding2, 'studios'],
  ['associations', LuUsers, 'associations'],
  ['games', LuGamepad2, 'games'],
  ['events', LuCalendarDays, 'events'],
];

// Scene size in five steps, from a handful to the biggest.
const SIZE_STEPS = [1, 5, 15, 50, Infinity];
const sizeStep = (n) => SIZE_STEPS.findIndex((bound) => n <= bound);
const SIZE_BG = ['green.50', 'green.100', 'green.200', 'green.300', 'green.500'];
const SIZE_BG_DARK = ['green.950', 'green.900', 'green.800', 'green.700', 'green.600'];

const Tile = ({ country, rank, variant }) => {
  const total = country.studios + country.associations;
  const palette = PALETTE[country.continent] ?? 'gray';
  const colors =
    variant === 'size'
      ? {
          bg: { base: SIZE_BG[sizeStep(total)], _dark: SIZE_BG_DARK[sizeStep(total)] },
          borderColor: 'green.muted',
          symbol: 'fg',
        }
      : { bg: `${palette}.subtle`, borderColor: `${palette}.muted`, symbol: `${palette}.fg` };

  return (
    <LinkBox
      as="li"
      aspectRatio={1}
      p={2}
      borderWidth="1px"
      borderRadius="md"
      bg={colors.bg}
      borderColor={colors.borderColor}
      display="flex"
      flexDirection="column"
      transition="transform 120ms"
      _hover={{ transform: 'scale(1.06)', zIndex: 1, shadow: 'md' }}
      title={`${country.name}: ${STATS.map(([key, , label]) => `${country[key]} ${label}`).join(', ')}`}
    >
      <Flex justify="space-between" fontSize="2xs" color="fg.muted" lineHeight="1">
        <span>{rank}</span>
        <span>{total}</span>
      </Flex>
      <LinkOverlay asChild>
        <Link to={`/country/${country.code.toLowerCase()}`}>
          <Text fontSize="2xl" fontWeight="800" lineHeight="1.1" mt={1} color={colors.symbol}>
            {country.code}
          </Text>
        </Link>
      </LinkOverlay>
      <Text fontSize="xs" lineClamp={1} lineHeight="1.2">
        {country.name}
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" mt="auto" columnGap={1} rowGap={0} fontSize="2xs" color="fg.muted">
        {STATS.map(([key, icon, label]) => (
          <Flex key={key} align="center" gap="2px" opacity={country[key] ? 1 : 0.35} aria-label={`${country[key]} ${label}`}>
            <Icon as={icon} boxSize="10px" />
            {country[key]}
          </Flex>
        ))}
      </Grid>
    </LinkBox>
  );
};

const CountriesPeriodicTable = ({ countries, variant }) => {
  const size = (c) => c.studios + c.associations;
  const ranked = [...countries].sort((a, b) => size(b) - size(a) || a.name.localeCompare(b.name));
  const rank = new Map(ranked.map((c, i) => [c.code, i + 1]));
  const ordered =
    variant === 'size'
      ? ranked
      : [...ranked].sort(
          (a, b) =>
            CONTINENTS.findIndex(([code]) => code === a.continent) - CONTINENTS.findIndex(([code]) => code === b.continent) ||
            rank.get(a.code) - rank.get(b.code)
        );

  return (
    <Box>
      <Flex gap={4} wrap="wrap" fontSize="sm" color="fg.muted" mb={4} align="center">
        {variant === 'size'
          ? ['1', '2–5', '6–15', '16–50', '51+'].map((label, i) => (
              <Flex key={label} align="center" gap={1}>
                <Box w="14px" h="14px" borderRadius="sm" borderWidth="1px" bg={{ base: SIZE_BG[i], _dark: SIZE_BG_DARK[i] }} />
                {label}
              </Flex>
            ))
          : CONTINENTS.filter(([code]) => countries.some((c) => c.continent === code)).map(([code, name, palette]) => (
              <Flex key={code} align="center" gap={1}>
                <Box w="14px" h="14px" borderRadius="sm" borderWidth="1px" bg={`${palette}.subtle`} borderColor={`${palette}.muted`} />
                {name}
              </Flex>
            ))}
        <Flex gap={3} ml={{ md: 'auto' }}>
          {STATS.map(([key, icon, label]) => (
            <Flex key={key} align="center" gap={1}>
              <Icon as={icon} boxSize="12px" /> {label}
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Grid as="ul" listStyle="none" templateColumns="repeat(auto-fill, minmax(6.5rem, 1fr))" gap={2}>
        {ordered.map((country) => (
          <Tile key={country.code} country={country} rank={rank.get(country.code)} variant={variant} />
        ))}
      </Grid>
    </Box>
  );
};

export default CountriesPeriodicTable;
