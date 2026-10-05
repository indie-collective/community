// PROTOTYPE (#258): the country map at the centre, its main areas called
// out with labels in the margins and lines to where they are. Throwaway;
// lives on chore/prototype-annotated-map. ?variant=annotated on /country/:code.
import { Box, Flex, Heading, Link as ChakraLink, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import { areasOf } from '../utils/areas.prototype';

const AREAS = 7;
const css = (token) => `var(--chakra-colors-${token.replace('.', '-')})`;
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
const split = ({ studios, associations }) =>
  [studios && plural(studios, 'studio'), associations && plural(associations, 'association')].filter(Boolean).join(', ');

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

function useMap(code, cities, areas) {
  const [map, setMap] = useState(null);
  useEffect(() => {
    let current = true;
    Promise.all([fetch(`/maps/${code}.json`).then((r) => r.json()), import('../utils/cityMap')])
      .then(([topology, lib]) => {
        const marks = [...cities, ...areas.map((a, i) => ({ ...a, name: `area:${i}` }))];
        if (current) setMap(lib.drawCityMap(code, topology, marks));
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [code, cities, areas]);
  return map;
}

// Labels in two columns beside the map, each next to its area's height,
// pushed apart so they never overlap.
function layoutLabels(areas, map, labelHeight) {
  const [x0, y0, w, h] = map.viewBox;
  const items = areas
    .map((area, i) => ({ area, i, point: map.points[`area:${i}`] }))
    .filter((item) => item.point);
  const middle = x0 + w / 2;
  const left = items.filter((item) => item.point[0] < middle);
  const right = items.filter((item) => item.point[0] >= middle);
  // Keep the columns roughly even.
  while (left.length > right.length + 1) right.push(left.splice(left.indexOf(left.reduce((a, b) => (b.point[0] > a.point[0] ? b : a))), 1)[0]);
  while (right.length > left.length + 1) left.push(right.splice(right.indexOf(right.reduce((a, b) => (b.point[0] < a.point[0] ? b : a))), 1)[0]);

  const place = (column, side) => {
    column.sort((a, b) => a.point[1] - b.point[1]);
    let y = y0 - Infinity;
    for (const item of column) {
      item.y = Math.max(item.point[1], y + labelHeight);
      y = item.y;
    }
    // Pull back up if the column runs off the bottom.
    let bottom = y0 + h - labelHeight / 2;
    for (let k = column.length - 1; k >= 0; k -= 1) {
      column[k].y = Math.min(column[k].y, bottom);
      bottom = column[k].y - labelHeight;
    }
    column.forEach((item) => (item.side = side));
  };
  place(left, 'left');
  place(right, 'right');
  return [...left, ...right];
}

const AnnotatedMap = ({ map, cities, areas, active, setActive, onChoose, narrow }) => {
  const [x0, y0, w, h] = map.viewBox;
  const columnWidth = narrow ? 0 : w * 0.5;
  const fs = h * (narrow ? 0.045 : 0.044);
  const labelHeight = fs * 3.3;
  const labels = narrow ? [] : layoutLabels(areas, map, labelHeight);
  const most = areas[0]?.count ?? 1;
  const halo = (count) => Math.max(w * 0.012, w * 0.055 * Math.sqrt(count / most));
  const activeCities = new Set(active != null ? areas[active].cities.map((c) => c.name) : []);
  const viewBox = [x0 - columnWidth, y0 - fs, w + 2 * columnWidth, h + 2 * fs];

  return (
    <svg
      viewBox={viewBox.join(' ')}
      role="group"
      aria-label="Map of the country's main areas for indie games"
      style={{ width: '100%', height: 'auto', maxHeight: narrow ? '28rem' : 'none', display: 'block' }}
      onPointerLeave={() => setActive(null)}
    >
      <path d={map.outline} fill={css('bg.muted')} stroke={css('border.emphasized')} vectorEffect="non-scaling-stroke" />
      {map.insets && <path d={map.insets} fill="none" stroke={css('border')} vectorEffect="non-scaling-stroke" />}

      {/* Every city, as a small dot: the texture of the scene. */}
      {cities.map((city) => {
        const xy = map.points[city.name];
        if (!xy) return null;
        return (
          <circle
            key={city.name}
            cx={xy[0]}
            cy={xy[1]}
            r={w * 0.0045}
            fill={css(activeCities.has(city.name) ? 'green.700' : 'green.solid')}
            fillOpacity={active == null || activeCities.has(city.name) ? 0.7 : 0.25}
            pointerEvents="none"
          />
        );
      })}

      {/* Each main area: a halo sized by its count, and a callout. */}
      {areas.map((area, i) => {
        const xy = map.points[`area:${i}`];
        if (!xy) return null;
        const on = active === i;
        return (
          <g key={area.name}>
            <circle
              cx={xy[0]}
              cy={xy[1]}
              r={halo(area.count)}
              fill={css('green.solid')}
              fillOpacity={on ? 0.3 : 0.12}
              stroke={css(on ? 'fg' : 'green.solid')}
              strokeWidth={on ? 2 : 1.25}
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
              onPointerEnter={() => setActive(i)}
              onClick={() => onChoose(i)}
            />
            {narrow && (
              <text
                x={xy[0]}
                y={xy[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fs * 0.9}
                fontWeight="700"
                fill={css('fg')}
                stroke={css('bg')}
                strokeWidth={fs * 0.25}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {i + 1}
              </text>
            )}
          </g>
        );
      })}

      {labels.map(({ area, i, point, y, side }) => {
        const on = active === i;
        const left = side === 'left';
        const textX = left ? x0 - fs * 0.6 : x0 + w + fs * 0.6;
        const edgeX = left ? x0 + fs * 0.2 : x0 + w - fs * 0.2;
        const barW = columnWidth * 0.75 * (area.count / most);
        const studiosW = barW * (area.studios / area.count);
        const barX = left ? textX - barW : textX;
        return (
          <g
            key={`label-${area.name}`}
            style={{ cursor: 'pointer' }}
            onPointerEnter={() => setActive(i)}
            onClick={() => onChoose(i)}
            tabIndex={0}
            role="button"
            aria-label={`${area.name} area: ${split(area)}`}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onChoose(i))}
          >
            <polyline
              points={`${left ? textX + fs * 0.3 : textX - fs * 0.3},${y} ${edgeX},${y} ${point[0]},${point[1]}`}
              fill="none"
              stroke={css(on ? 'fg' : 'fg.muted')}
              strokeWidth={on ? 1.75 : 1}
              strokeOpacity={on ? 1 : 0.6}
              vectorEffect="non-scaling-stroke"
            />
            <text x={textX} y={y - fs * 0.35} textAnchor={left ? 'end' : 'start'} fontSize={fs * 1.1} fontWeight="700" fill={css('fg')}>
              {area.name}
              {area.cities.length > 1 && (
                <tspan fontWeight="400" fill={css('fg.muted')} fontSize={fs * 0.85}>
                  {' '}area
                </tspan>
              )}
            </text>
            <text x={textX} y={y + fs * 0.85} textAnchor={left ? 'end' : 'start'} fontSize={fs * 0.85} fill={css('fg.muted')}>
              {split(area)}
            </text>
            <rect x={barX} y={y + fs * 1.35} width={studiosW} height={fs * 0.35} rx={fs * 0.17} fill={css('yellow.solid')} />
            <rect
              x={barX + studiosW + (area.associations ? fs * 0.1 : 0)}
              y={y + fs * 1.35}
              width={Math.max(0, barW - studiosW - (area.associations ? fs * 0.1 : 0))}
              height={fs * 0.35}
              rx={fs * 0.17}
              fill={css('green.solid')}
            />
          </g>
        );
      })}
    </svg>
  );
};

const AreaDetails = ({ area, code, onClose }) => (
  <Box borderWidth="1px" borderRadius="lg" p={4} bg="bg.panel" mt={4}>
    <Flex justify="space-between" align="baseline">
      <Heading as="h4" size="md">
        {area.name}
        {area.cities.length > 1 ? ' area' : ''}
        <Text as="span" fontWeight="normal" color="fg.muted" fontSize="md">
          {' '}· {split(area)}
        </Text>
      </Heading>
      <ChakraLink as="button" fontSize="sm" color="fg.muted" onClick={onClose}>
        Close
      </ChakraLink>
    </Flex>
    <Stack as="ul" listStyle="none" mt={3} gap={1} fontSize="sm">
      {area.cities.map((city) => (
        <Flex as="li" key={city.name} justify="space-between" gap={3} maxW="32rem">
          <ChakraLink asChild>
            <Link to={`/studios?country=${code}&city=${encodeURIComponent(city.name)}`}>{city.name}</Link>
          </ChakraLink>
          <Text color="fg.muted">{split(city)}</Text>
        </Flex>
      ))}
    </Stack>
  </Box>
);

const CountryAnnotatedMap = ({ code, name, cities }) => {
  const narrow = useNarrow();
  const areas = useMemo(() => areasOf(cities).slice(0, AREAS), [cities]);
  const map = useMap(code, cities, areas);
  const [active, setActive] = useState(null);
  const [chosen, setChosen] = useState(null);

  return (
    <Box>
      {map ? (
        <AnnotatedMap
          map={map}
          cities={cities}
          areas={areas}
          active={active ?? chosen}
          setActive={setActive}
          onChoose={(i) => setChosen(chosen === i ? null : i)}
          narrow={narrow}
        />
      ) : (
        <Skeleton aspectRatio={16 / 9} borderRadius="md" />
      )}
      {narrow && (
        <Stack as="ol" mt={3} gap={2}>
          {areas.map((area, i) => (
            <Box as="li" key={area.name} listStyle="none" onClick={() => setChosen(chosen === i ? null : i)}>
              <Text fontWeight="semibold">
                {i + 1}. {area.name}
                {area.cities.length > 1 ? ' area' : ''}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {split(area)}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
      <Flex justify="space-between" gap={3} wrap="wrap" mt={2} fontSize="sm">
        <Text color="fg.muted">
          The {areas.length} biggest areas of {plural(cities.length, 'city', 'cities')}. Click one for its cities.
        </Text>
        <ChakraLink asChild textDecoration="underline">
          <Link to={`/places?country=${code}`}>Explore {name} on the map</Link>
        </ChakraLink>
      </Flex>
      {chosen != null && <AreaDetails area={areas[chosen]} code={code} onClose={() => setChosen(null)} />}
    </Box>
  );
};

export default CountryAnnotatedMap;
