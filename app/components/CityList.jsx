import { Box, Flex, List, Text } from '@chakra-ui/react';

// A country's biggest cities as a ranked list with the studio/association
// split (#258), for countries the map can't show.

const STUDIO = 'yellow.solid';
const ASSOCIATION = 'green.solid';

const plural = (n, one, many = `${one}s`) =>
  `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

const CityList = ({ cities, limit = 10 }) => {
  const listed = cities.slice(0, limit);
  const most = listed[0]?.count ?? 0;
  if (listed.length === 0) {
    return <Text color="fg.muted">No studios or associations here yet.</Text>;
  }
  return (
    <List.Root listStyle="none" gap={3} maxW="44rem">
      {listed.map((city) => (
        <List.Item key={city.name} display="block">
          <Flex justify="space-between" gap={3}>
            <Text fontWeight="semibold" lineClamp={1}>
              {city.name}
              {city.region && city.region !== city.name && (
                <Text as="span" fontWeight="normal" color="fg.muted">
                  , {city.region}
                </Text>
              )}
            </Text>
            <Text whiteSpace="nowrap" fontSize="sm" color="fg.muted">
              {[
                city.studios && plural(city.studios, 'studio'),
                city.associations && plural(city.associations, 'association'),
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </Flex>
          <Flex
            aria-hidden
            mt={1}
            h="8px"
            gap="2px"
            w={`${Math.max((city.count / most) * 100, 2)}%`}
          >
            {city.studios > 0 && (
              <Box flex={city.studios} bg={STUDIO} borderRadius="full" />
            )}
            {city.associations > 0 && (
              <Box
                flex={city.associations}
                bg={ASSOCIATION}
                borderRadius="full"
              />
            )}
          </Flex>
        </List.Item>
      ))}
    </List.Root>
  );
};

export default CityList;
