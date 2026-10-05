import {
  Box,
  Flex,
  Grid,
  Heading,
  Link as ChakraLink,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

// A country's cities (#258): a ranked list with the studio/association
// split, and a map with a circle per city, linked both ways. Hovering or
// focusing a city highlights it in both; choosing one shows who's there.
// The map is the at-a-glance "where are the hubs"; /places is for exploring.

const STUDIO = 'yellow.solid';
const ASSOCIATION = 'green.solid';
const LIST_SIZE = 10;

const plural = (n, one, many = `${one}s`) =>
  `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

const splitText = ({ studios, associations }) =>
  [
    studios && plural(studios, 'studio'),
    associations && plural(associations, 'association'),
  ]
    .filter(Boolean)
    .join(', ');

const cssVar = (token) => `var(--chakra-colors-${token.replace('.', '-')})`;

function useCityMap(code, cities, enabled) {
  const [map, setMap] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    let current = true;
    Promise.all([
      fetch(`/maps/${code}.json`).then((res) => {
        if (!res.ok) throw new Error(`No map for ${code}`);
        return res.json();
      }),
      import('../utils/cityMap'),
    ])
      .then(
        ([topology, lib]) =>
          current && setMap(lib.drawCityMap(code, topology, cities))
      )
      .catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, [code, cities, enabled]);
  return { map, failed };
}

const CityMap = ({ map, cities, focus, onFocus, onChoose }) => {
  const [, , width] = map.viewBox;
  const most = cities[0]?.count ?? 1;
  // Circle area follows the count; the smallest stay visible and clickable.
  const radius = (count) =>
    Math.max(width * 0.007, width * 0.05 * Math.sqrt(count / most));
  // Largest first, so smaller circles sit on top.
  const drawn = cities.filter((city) => map.points[city.name]);
  const labelled = new Set([...cities.slice(0, 3).map((c) => c.name), focus]);

  return (
    <svg
      viewBox={map.viewBox.join(' ')}
      role="group"
      aria-label="Map of cities, circles sized by number of studios and associations"
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '32rem',
        display: 'block',
      }}
      onPointerLeave={() => onFocus(null)}
    >
      <path
        d={map.outline}
        fill={cssVar('bg.muted')}
        stroke={cssVar('border.emphasized')}
        vectorEffect="non-scaling-stroke"
      />
      {map.insets && (
        <path
          d={map.insets}
          fill="none"
          stroke={cssVar('border')}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {drawn.map((city) => {
        const [x, y] = map.points[city.name];
        const on = focus === city.name;
        return (
          <circle
            key={city.name}
            cx={x}
            cy={y}
            r={radius(city.count)}
            fill={cssVar('green.solid')}
            fillOpacity={focus && !on ? 0.2 : 0.6}
            stroke={cssVar(on ? 'fg' : 'bg')}
            strokeWidth={on ? 2.5 : 1}
            vectorEffect="non-scaling-stroke"
            tabIndex={0}
            role="button"
            aria-label={`${city.name}: ${splitText(city)}`}
            style={{
              cursor: 'pointer',
              outline: 'none',
              transition: 'fill-opacity 120ms',
            }}
            onPointerEnter={() => onFocus(city.name)}
            onFocus={() => onFocus(city.name)}
            onBlur={() => onFocus(null)}
            onClick={() => onChoose(city.name)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChoose(city.name);
              }
            }}
          />
        );
      })}
      {drawn
        .filter((city) => labelled.has(city.name))
        .map((city) => {
          const [x, y] = map.points[city.name];
          return (
            <text
              key={`label-${city.name}`}
              x={x + radius(city.count) + width * 0.006}
              y={y}
              dominantBaseline="middle"
              fontSize={width * 0.022}
              fontWeight={city.name === focus ? 700 : 500}
              fill={cssVar('fg')}
              stroke={cssVar('bg')}
              strokeWidth={width * 0.006}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {city.name}
            </text>
          );
        })}
    </svg>
  );
};

const CityDetails = ({ city, code, onClose }) => {
  const ref = useRef(null);
  // Below the map, it can open out of sight: bring it into view.
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [city.name]);
  return (
    <Box
      ref={ref}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="bg.panel"
      aria-live="polite"
    >
      <Flex justify="space-between" align="baseline" gap={3}>
        <Heading as="h4" size="md">
          {city.name}
          {city.region && city.region !== city.name && (
            <Text as="span" fontWeight="normal" color="fg.muted">
              , {city.region}
            </Text>
          )}
        </Heading>
        <ChakraLink
          as="button"
          fontSize="sm"
          color="fg.muted"
          onClick={onClose}
        >
          Close
        </ChakraLink>
      </Flex>
      {[
        ['studio', 'studios', '/studios'],
        ['association', 'associations', '/associations'],
      ].map(([type, label, list]) => {
        const orgs = city.orgs.filter((org) => org.type === type);
        if (orgs.length === 0) return null;
        return (
          <Box key={type} mt={3}>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>
              {plural(orgs.length, type)}
            </Text>
            <Flex wrap="wrap" columnGap={3} rowGap={1} fontSize="sm">
              {orgs.slice(0, 12).map((org) => (
                <ChakraLink key={org.id} asChild>
                  <Link to={`/org/${org.id}`}>{org.name}</Link>
                </ChakraLink>
              ))}
            </Flex>
            <ChakraLink
              asChild
              fontSize="sm"
              textDecoration="underline"
              mt={1}
              display="inline-block"
            >
              <Link
                to={`${list}?country=${code}&city=${encodeURIComponent(city.name)}`}
              >
                All {label} in {city.name}
              </Link>
            </ChakraLink>
          </Box>
        );
      })}
    </Box>
  );
};

const CountryCities = ({ code, name, cities, hasMap }) => {
  const [focus, setFocus] = useState(null);
  const [chosen, setChosen] = useState(null);
  const withMap = hasMap && cities.some((city) => city.lat != null);
  const { map, failed } = useCityMap(code, cities, withMap);
  const showMap = withMap && !failed;

  const listed = cities.slice(0, LIST_SIZE);
  const most = listed[0]?.count ?? 0;
  const highlighted = focus ?? chosen;
  const choose = (city) => setChosen(chosen === city ? null : city);
  const chosenCity = cities.find((city) => city.name === chosen);

  if (cities.length === 0) {
    return <Text color="fg.muted">No studios or associations here yet.</Text>;
  }

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        lg: showMap ? 'minmax(0, 2fr) minmax(0, 3fr)' : 'minmax(0, 44rem)',
      }}
      gap={8}
    >
      <Box>
        <Flex gap={4} fontSize="sm" color="fg.muted" mb={3} aria-hidden>
          <Flex align="center" gap={1}>
            <Box w="12px" h="12px" borderRadius="sm" bg={STUDIO} /> Studios
          </Flex>
          <Flex align="center" gap={1}>
            <Box w="12px" h="12px" borderRadius="sm" bg={ASSOCIATION} />{' '}
            Associations
          </Flex>
        </Flex>
        <Stack
          as="ul"
          listStyle="none"
          gap={1}
          onPointerLeave={() => setFocus(null)}
        >
          {listed.map((city) => (
            <li key={city.name}>
              <Box
                as="button"
                type="button"
                w="100%"
                textAlign="left"
                px={2}
                py={1.5}
                borderRadius="md"
                bg={highlighted === city.name ? 'bg.emphasized' : 'transparent'}
                aria-pressed={chosen === city.name}
                aria-label={`${city.name}: ${splitText(city)}`}
                onPointerEnter={() => setFocus(city.name)}
                onFocus={() => setFocus(city.name)}
                onBlur={() => setFocus(null)}
                onClick={() => choose(city.name)}
              >
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
                    {splitText(city)}
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
              </Box>
            </li>
          ))}
        </Stack>
        {!showMap && chosenCity && (
          <Box mt={4}>
            <CityDetails
              city={chosenCity}
              code={code}
              onClose={() => setChosen(null)}
            />
          </Box>
        )}
      </Box>

      {showMap && (
        <Box>
          {map ? (
            <CityMap
              map={map}
              cities={cities}
              focus={highlighted}
              onFocus={setFocus}
              onChoose={choose}
            />
          ) : (
            <Skeleton aspectRatio={16 / 10} borderRadius="md" />
          )}
          <Flex
            justify="space-between"
            gap={3}
            wrap="wrap"
            mt={2}
            fontSize="sm"
          >
            <Text color="fg.muted">
              Circle size: studios and associations in each of{' '}
              {plural(cities.length, 'city', 'cities')}.
            </Text>
            <ChakraLink asChild textDecoration="underline">
              <Link to={`/places?country=${code}`}>
                Explore {name} on the map
              </Link>
            </ChakraLink>
          </Flex>
          {chosenCity && (
            <Box mt={4}>
              <CityDetails
                city={chosenCity}
                code={code}
                onClose={() => setChosen(null)}
              />
            </Box>
          )}
        </Box>
      )}
    </Grid>
  );
};

export default CountryCities;
