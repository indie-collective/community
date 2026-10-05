import { Box, Flex, Heading, List, Skeleton, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useColorModeValue } from './ui/color-mode';

// One hue, light to dark, for how many organisations a region holds (#73).
// Dark mode has its own steps: the fewest sit closest to the dark surface.
const STEPS_LIGHT = [
  'green.100',
  'green.300',
  'green.500',
  'green.700',
  'green.900',
];
const STEPS_DARK = [
  'green.900',
  'green.700',
  'green.500',
  'green.300',
  'green.100',
];

const token = (name) => `var(--chakra-colors-${name.replace('.', '-')})`;
const structures = (n) => `${n} ${n === 1 ? 'structure' : 'structures'}`;

/**
 * A country's regions shaded by how many studios and associations they
 * hold, counted from the organisations' coordinates. Drawn in the browser:
 * the map file and d3 load after the page.
 */
const CountryRegionMap = ({ code, name, points }) => {
  const [map, setMap] = useState(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(null);
  const steps = useColorModeValue(STEPS_LIGHT, STEPS_DARK);
  const none = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    let current = true;
    (async () => {
      const [topology, lib] = await Promise.all([
        fetch(`/maps/${code}.json`).then((res) => {
          if (!res.ok) throw new Error(`No map for ${code}`);
          return res.json();
        }),
        import('../utils/regionMap'),
      ]);
      const regions = lib.regionsOf(topology);
      const { counts, unplaced } = lib.countByRegion(regions, points);
      const bounds = lib.classify(counts);
      const { viewBox, paths, insets } = lib.drawRegions(code, regions);
      if (!current) return;
      setMap({
        viewBox,
        insets,
        unplaced,
        labels: lib.classLabels(bounds),
        regions: regions.map((region, i) => ({
          name: region.properties.name,
          d: paths[i],
          count: counts[i],
          step: lib.classOf(counts[i], bounds),
        })),
      });
    })().catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, [code, points]);

  if (failed) return null;

  const fill = (step) => token(step === 0 ? none : steps[step - 1]);
  const ranked = map?.regions
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <Box as="section" aria-labelledby="regions-heading">
      <Heading as="h3" size="lg" mb={5} id="regions-heading">
        By region
      </Heading>

      {!map ? (
        <Skeleton aspectRatio={16 / 10} borderRadius="md" />
      ) : (
        <>
          <Box position="relative">
            <svg
              viewBox={map.viewBox}
              role="group"
              aria-label={`Map of ${name}'s regions, shaded by number of studios and associations`}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '32rem',
                display: 'block',
              }}
              onPointerLeave={() => setActive(null)}
            >
              {map.regions.map((region, i) =>
                region.d ? (
                  <path
                    key={region.name}
                    d={region.d}
                    fill={fill(region.step)}
                    // Borders in the page colour keep neighbours apart.
                    stroke={token('bg')}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    tabIndex={0}
                    aria-label={`${region.name}: ${structures(region.count)}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    style={{ outline: 'none', cursor: 'default' }}
                  />
                ) : null
              )}
              {/* Keep the highlighted outline on top of its neighbours. */}
              {active !== null && map.regions[active]?.d && (
                <path
                  d={map.regions[active].d}
                  fill="none"
                  stroke={token('fg')}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              )}
              {map.insets && (
                <path
                  d={map.insets}
                  fill="none"
                  stroke={token('border.emphasized')}
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
            <Text
              aria-live="polite"
              position="absolute"
              top={2}
              left={2}
              px={2}
              py={1}
              borderRadius="md"
              bg="bg.panel"
              shadow="sm"
              fontSize="sm"
              visibility={active === null ? 'hidden' : 'visible'}
            >
              {active !== null && (
                <>
                  <Text as="span" fontWeight="semibold">
                    {map.regions[active].name}
                  </Text>
                  {': '}
                  {structures(map.regions[active].count)}
                </>
              )}
            </Text>
          </Box>

          {map.labels.length > 0 && (
            <Flex
              as="ul"
              listStyle="none"
              gap={3}
              mt={3}
              wrap="wrap"
              fontSize="sm"
              color="fg.muted"
              aria-label="Legend: studios and associations per region"
            >
              {[
                ['None', 0],
                ...map.labels.map((label, i) => [label, i + 1]),
              ].map(([label, step]) => (
                <Flex as="li" key={label} align="center" gap={1}>
                  <Box
                    w="14px"
                    h="14px"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderColor="border"
                    style={{ background: fill(step) }}
                  />
                  {label}
                </Flex>
              ))}
            </Flex>
          )}

          <Box as="details" mt={3} fontSize="sm">
            <Box as="summary" cursor="pointer" color="fg.muted">
              Regions as a list
            </Box>
            <List.Root listStyle="none" mt={2} gap={1}>
              {ranked.map((region) => (
                <List.Item
                  key={region.name}
                  display="flex"
                  justifyContent="space-between"
                  maxW="24rem"
                >
                  <span>{region.name}</span>
                  <span>{structures(region.count)}</span>
                </List.Item>
              ))}
            </List.Root>
            {map.unplaced > 0 && (
              <Text mt={2} color="fg.muted">
                {structures(map.unplaced)} without a precise location aren't on
                the map.
              </Text>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default CountryRegionMap;
