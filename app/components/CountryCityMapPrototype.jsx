// PROTOTYPE (country page, replaces #257's region map?): three structurally
// different ways to show where a country's studios and associations are.
// Switch with ?variant=A|B|C on /country/:code. Throwaway — the winner gets
// rewritten properly; this file and PrototypeSwitcher go to a branch.
//
//   A: ranked list and city map side by side, linked both ways.
//   B: map first, with labels; click a city to see who's there.
//   C: no map; a split list with expandable cities, and a link to /places.
import { Box, Flex, Grid, Heading, Link as ChakraLink, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

const STUDIO = 'var(--chakra-colors-yellow-solid)';
const ASSOC = 'var(--chakra-colors-green-solid)';
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ---------- shared: data, map, bars ---------- */

function useGeometry(code, cities, hasMap) {
  const [geometry, setGeometry] = useState(null);
  useEffect(() => {
    if (!hasMap) return undefined;
    let current = true;
    Promise.all([fetch(`/maps/${code}.json`).then((r) => r.json()), import('../utils/cityMap.prototype')])
      .then(([topology, lib]) => current && setGeometry(lib.prepare(code, topology, cities)))
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [code, cities, hasMap]);
  return geometry;
}

const CityMap = ({ geometry, cities, active, setActive, selected, onSelect, labels = 0, maxH = '34rem' }) => {
  if (!geometry) return <Skeleton aspectRatio={16 / 10} borderRadius="md" />;
  const [, , vbw] = geometry.viewBox;
  const max = cities[0]?.count ?? 1;
  const radius = (count) => Math.max(vbw * 0.006, vbw * 0.05 * Math.sqrt(count / max));
  // Largest first, so small cities sit on top and stay clickable.
  const drawn = cities.filter((c) => geometry.points[c.name]);
  const labelled = new Set(cities.slice(0, labels).map((c) => c.name));
  const focus = active ?? selected;
  return (
    <svg
      viewBox={geometry.viewBox.join(' ')}
      style={{ width: '100%', height: 'auto', maxHeight: maxH, display: 'block' }}
      role="group"
      aria-label="Map of cities, circles sized by number of studios and associations"
      onPointerLeave={() => setActive(null)}
    >
      <path d={geometry.outline} fill="var(--chakra-colors-bg-muted)" stroke="var(--chakra-colors-border-emphasized)" vectorEffect="non-scaling-stroke" />
      {geometry.insets && <path d={geometry.insets} fill="none" stroke="var(--chakra-colors-border)" vectorEffect="non-scaling-stroke" />}
      {drawn.map((city) => {
        const [x, y] = geometry.points[city.name];
        const on = focus === city.name;
        return (
          <circle
            key={city.name}
            cx={x}
            cy={y}
            r={radius(city.count)}
            fill="var(--chakra-colors-green-solid)"
            fillOpacity={focus && !on ? 0.2 : 0.6}
            stroke={on ? 'var(--chakra-colors-fg)' : 'var(--chakra-colors-bg)'}
            strokeWidth={on ? 2.5 : 1}
            vectorEffect="non-scaling-stroke"
            tabIndex={0}
            aria-label={`${city.name}: ${plural(city.count, 'structure')}`}
            style={{ cursor: 'pointer', outline: 'none', transition: 'fill-opacity 120ms' }}
            onPointerEnter={() => setActive(city.name)}
            onFocus={() => setActive(city.name)}
            onBlur={() => setActive(null)}
            onClick={() => onSelect?.(city.name)}
          />
        );
      })}
      {drawn
        .filter((c) => labelled.has(c.name) || c.name === focus)
        .map((city) => {
          const [x, y] = geometry.points[city.name];
          return (
            <text
              key={`label-${city.name}`}
              x={x + radius(city.count) + vbw * 0.006}
              y={y}
              dominantBaseline="middle"
              fontSize={vbw * 0.022}
              fontWeight={city.name === focus ? 700 : 500}
              fill="var(--chakra-colors-fg)"
              stroke="var(--chakra-colors-bg)"
              strokeWidth={vbw * 0.006}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {city.name} {city.count}
            </text>
          );
        })}
    </svg>
  );
};

const SplitBar = ({ city, max, h = '8px' }) => (
  <Flex aria-hidden h={h} w={`${Math.max((city.count / max) * 100, 2)}%`} gap="2px">
    {city.studios > 0 && <Box flex={city.studios} bg={STUDIO} borderRadius="full" />}
    {city.associations > 0 && <Box flex={city.associations} bg={ASSOC} borderRadius="full" />}
  </Flex>
);

const SplitLegend = () => (
  <Flex gap={4} fontSize="sm" color="fg.muted">
    <Flex align="center" gap={1}>
      <Box w="12px" h="12px" borderRadius="sm" bg={STUDIO} /> Studios
    </Flex>
    <Flex align="center" gap={1}>
      <Box w="12px" h="12px" borderRadius="sm" bg={ASSOC} /> Associations
    </Flex>
  </Flex>
);

const splitText = (city) =>
  [city.studios && plural(city.studios, 'studio'), city.associations && plural(city.associations, 'association')]
    .filter(Boolean)
    .join(', ');

const CityOrgs = ({ city }) => (
  <Box borderWidth="1px" borderRadius="md" p={4} bg="bg.panel">
    <Heading as="h4" size="md">
      {city.name}
      {city.region && city.region !== city.name && (
        <Text as="span" fontWeight="normal" color="fg.muted">
          , {city.region}
        </Text>
      )}
    </Heading>
    <Text color="fg.muted" mb={3}>
      {splitText(city)}
    </Text>
    {['studio', 'association'].map((type) => {
      const list = city.orgs.filter((o) => o.type === type);
      if (!list.length) return null;
      return (
        <Box key={type} mb={3}>
          <Text fontWeight="semibold" fontSize="sm" mb={1}>
            {type === 'studio' ? 'Studios' : 'Associations'}
          </Text>
          <Flex wrap="wrap" columnGap={3} rowGap={1} fontSize="sm">
            {list.slice(0, 24).map((o) => (
              <ChakraLink key={o.id} asChild>
                <Link to={`/org/${o.id}`}>{o.name}</Link>
              </ChakraLink>
            ))}
            {list.length > 24 && <Text color="fg.muted">+{list.length - 24} more</Text>}
          </Flex>
        </Box>
      );
    })}
    <Text fontSize="sm" color="fg.muted">
      (Real version: “All in {city.name} →” opens /studios filtered by city, which doesn’t exist yet.)
    </Text>
  </Box>
);

/* ---------- A: linked list + map ---------- */

const VariantA = ({ cities, geometry }) => {
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  const top = cities.slice(0, 10);
  const max = top[0]?.count ?? 1;
  const focus = active ?? selected;
  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 3fr)' }} gap={8}>
      <Box>
        <Flex justify="space-between" align="baseline" mb={4} wrap="wrap" gap={2}>
          <Heading as="h3" size="lg">
            Most vibrant cities
          </Heading>
          <SplitLegend />
        </Flex>
        <Stack gap={1} onPointerLeave={() => setActive(null)}>
          {top.map((city) => (
            <Box
              as="button"
              key={city.name}
              textAlign="left"
              px={2}
              py={1.5}
              borderRadius="md"
              bg={focus === city.name ? 'bg.emphasized' : 'transparent'}
              onPointerEnter={() => setActive(city.name)}
              onFocus={() => setActive(city.name)}
              onClick={() => setSelected(selected === city.name ? null : city.name)}
              aria-pressed={selected === city.name}
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
              <Box mt={1}>
                <SplitBar city={city} max={max} />
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box>
        <CityMap geometry={geometry} cities={cities} active={active} setActive={setActive} selected={selected} onSelect={(n) => setSelected(selected === n ? null : n)} labels={3} />
        <Text fontSize="sm" color="fg.muted" mt={2}>
          Circle area: studios and associations in the city. Hover a city in the list or on the map; click to see who’s there.
        </Text>
        {selected && (
          <Box mt={4}>
            <CityOrgs city={cities.find((c) => c.name === selected)} />
          </Box>
        )}
      </Box>
    </Grid>
  );
};

/* ---------- B: map first, drill-down panel ---------- */

const VariantB = ({ cities, geometry }) => {
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(cities[0]?.name ?? null);
  const city = cities.find((c) => c.name === selected);
  return (
    <Box>
      <Heading as="h3" size="lg" mb={3}>
        Where the scene is
      </Heading>
      <Flex gap={2} wrap="wrap" mb={4}>
        {cities.slice(0, 10).map((c) => (
          <Box
            as="button"
            key={c.name}
            px={3}
            py={1}
            borderRadius="full"
            borderWidth="1px"
            fontSize="sm"
            bg={selected === c.name ? 'fg' : active === c.name ? 'bg.emphasized' : 'bg.panel'}
            color={selected === c.name ? 'bg' : 'fg'}
            onPointerEnter={() => setActive(c.name)}
            onPointerLeave={() => setActive(null)}
            onClick={() => setSelected(c.name)}
          >
            {c.name} · {c.count}
          </Box>
        ))}
      </Flex>
      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }} gap={6} alignItems="start">
        <CityMap geometry={geometry} cities={cities} active={active} setActive={setActive} selected={selected} onSelect={setSelected} labels={8} maxH="40rem" />
        {city && <CityOrgs city={city} />}
      </Grid>
    </Box>
  );
};

/* ---------- C: no map, split list ---------- */

const VariantC = ({ cities, code, name }) => {
  const [all, setAll] = useState(false);
  const shown = all ? cities : cities.slice(0, 12);
  const max = cities[0]?.count ?? 1;
  return (
    <Box maxW="48rem">
      <Flex justify="space-between" align="baseline" mb={4} wrap="wrap" gap={2}>
        <Heading as="h3" size="lg">
          Cities
        </Heading>
        <SplitLegend />
      </Flex>
      <Stack gap={0} borderTopWidth="1px">
        {shown.map((city, i) => (
          <Box as="details" key={city.name} borderBottomWidth="1px" py={2}>
            <Box as="summary" cursor="pointer" listStyleType="none">
              <Grid templateColumns="2rem minmax(0, 1fr) auto" gap={3} alignItems="center">
                <Text color="fg.muted" fontSize="sm">
                  {i + 1}
                </Text>
                <Box>
                  <Text fontWeight="semibold" lineClamp={1}>
                    {city.name}
                    {city.region && city.region !== city.name && (
                      <Text as="span" fontWeight="normal" color="fg.muted">
                        , {city.region}
                      </Text>
                    )}
                  </Text>
                  <Box mt={1}>
                    <SplitBar city={city} max={max} h="6px" />
                  </Box>
                </Box>
                <Text fontSize="sm" whiteSpace="nowrap">
                  <b>{city.studios}</b> <Text as="span" color="fg.muted">studios</Text> · <b>{city.associations}</b>{' '}
                  <Text as="span" color="fg.muted">assoc.</Text>
                </Text>
              </Grid>
            </Box>
            <Box mt={3} ml="2.75rem">
              <CityOrgs city={city} />
            </Box>
          </Box>
        ))}
      </Stack>
      <Flex mt={3} gap={4}>
        {cities.length > 12 && (
          <ChakraLink as="button" onClick={() => setAll(!all)} textDecoration="underline">
            {all ? 'Show fewer' : `Show all ${cities.length} cities`}
          </ChakraLink>
        )}
        <ChakraLink asChild textDecoration="underline">
          <Link to={`/places?country=${code}`}>See {name}’s studios and associations on the map</Link>
        </ChakraLink>
      </Flex>
    </Box>
  );
};

/* ---------- switch ---------- */

const CountryCityMapPrototype = ({ variant, code, name, cities, hasMap }) => {
  const stable = useMemo(() => cities, [cities]);
  const geometry = useGeometry(code, stable, hasMap && variant !== 'C');
  if (variant === 'B') return <VariantB cities={stable} geometry={geometry} />;
  if (variant === 'C') return <VariantC cities={stable} code={code} name={name} />;
  return <VariantA cities={stable} geometry={geometry} />;
};

export default CountryCityMapPrototype;
