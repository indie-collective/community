import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

import { areasOf, layoutCallouts } from '../utils/countryAreas';

// Where a country's scene is (#258): its map at the centre, every city a
// small dot, and its main areas called out with labels in the margins and
// lines to them. On phones, numbered markers and a list below the map.
// /places stays the place to explore; this answers "where are the hubs?".

const AREAS = 7;
const NARROW = '(max-width: 640px)';

const css = (token) => `var(--chakra-colors-${token.replace('.', '-')})`;
const plural = (n, one, many = `${one}s`) =>
  `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
const splitText = ({ studios, associations }) =>
  [
    studios && plural(studios, 'studio'),
    associations && plural(associations, 'association'),
  ]
    .filter(Boolean)
    .join(', ');
const areaName = (area) =>
  area.cities.length > 1 ? `${area.name} area` : area.name;

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

// The outline and positions load in the browser, with d3, after the page.
function useDrawing(code, cities, areas) {
  const [drawing, setDrawing] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    Promise.all([
      fetch(`/maps/${code}.json`).then((res) => {
        if (!res.ok) throw new Error(`No map for ${code}`);
        return res.json();
      }),
      import('../utils/cityMap'),
    ])
      .then(([topology, { drawCityMap }]) => {
        const marks = [
          ...cities,
          ...areas.map((area, i) => ({ ...area, name: `area:${i}` })),
        ];
        if (current) setDrawing(drawCityMap(code, topology, marks));
      })
      .catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, [code, cities, areas]);
  return { drawing, failed };
}

const Callout = ({
  area,
  index,
  point,
  y,
  side,
  fs,
  columnWidth,
  mapBox,
  most,
  on,
  onFocus,
  onChoose,
}) => {
  const [x0, , w] = mapBox;
  const left = side === 'left';
  const textX = left ? x0 - fs * 0.6 : x0 + w + fs * 0.6;
  const edgeX = left ? x0 + fs * 0.2 : x0 + w - fs * 0.2;
  const anchor = left ? 'end' : 'start';
  const barWidth = columnWidth * 0.75 * (area.count / most);
  const studiosWidth = barWidth * (area.studios / area.count);
  const gap = area.studios && area.associations ? fs * 0.1 : 0;
  const barX = left ? textX - barWidth : textX;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${areaName(area)}: ${splitText(area)}`}
      aria-pressed={on}
      style={{ cursor: 'pointer', outline: 'none' }}
      onPointerEnter={() => onFocus(index)}
      onFocus={() => onFocus(index)}
      onBlur={() => onFocus(null)}
      onClick={() => onChoose(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onChoose(index);
        }
      }}
    >
      <polyline
        points={`${left ? textX + fs * 0.3 : textX - fs * 0.3},${y} ${edgeX},${y} ${point[0]},${point[1]}`}
        fill="none"
        stroke={css(on ? 'fg' : 'fg.muted')}
        strokeOpacity={on ? 1 : 0.6}
        strokeWidth={on ? 1.75 : 1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={textX}
        y={y - fs * 0.35}
        textAnchor={anchor}
        fontSize={fs * 1.1}
        fontWeight="700"
        fill={css('fg')}
      >
        {area.name}
        {area.cities.length > 1 && (
          <tspan fontWeight="400" fontSize={fs * 0.85} fill={css('fg.muted')}>
            {' '}
            area
          </tspan>
        )}
      </text>
      <text
        x={textX}
        y={y + fs * 0.85}
        textAnchor={anchor}
        fontSize={fs * 0.85}
        fill={css('fg.muted')}
      >
        {splitText(area)}
      </text>
      {/* Studios (yellow) and associations (green), as on the city list. */}
      <rect
        x={barX}
        y={y + fs * 1.35}
        width={studiosWidth}
        height={fs * 0.35}
        rx={fs * 0.17}
        fill={css('yellow.solid')}
      />
      <rect
        x={barX + studiosWidth + gap}
        y={y + fs * 1.35}
        width={Math.max(0, barWidth - studiosWidth - gap)}
        height={fs * 0.35}
        rx={fs * 0.17}
        fill={css('green.solid')}
      />
    </g>
  );
};

const MapDrawing = ({
  drawing,
  cities,
  areas,
  highlighted,
  onFocus,
  onChoose,
  narrow,
}) => {
  const [x0, y0, w, h] = drawing.viewBox;
  const columnWidth = narrow ? 0 : w * 0.5;
  const fs = h * (narrow ? 0.045 : 0.044);
  const most = areas[0]?.count ?? 1;
  const halo = (count) =>
    Math.max(w * 0.012, w * 0.055 * Math.sqrt(count / most));
  const inFocus = new Set(
    highlighted != null ? areas[highlighted].cities.map((c) => c.name) : []
  );
  const points = areas.map((_, i) => drawing.points[`area:${i}`]);
  const callouts = narrow
    ? []
    : layoutCallouts(
        points.map((p) =>
          p ? { x: p[0], y: p[1] } : { x: x0 + w / 2, y: y0 }
        ),
        {
          middle: x0 + w / 2,
          top: y0 + fs,
          bottom: y0 + h - fs * 1.5,
          gap: fs * 3.3,
        }
      );

  return (
    <svg
      viewBox={[
        x0 - columnWidth,
        y0 - fs,
        w + 2 * columnWidth,
        h + 2 * fs,
      ].join(' ')}
      role="group"
      aria-label="Map of the main areas for indie games"
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: narrow ? '28rem' : 'none',
        display: 'block',
      }}
      onPointerLeave={() => onFocus(null)}
    >
      <path
        d={drawing.outline}
        fill={css('bg.muted')}
        stroke={css('border.emphasized')}
        vectorEffect="non-scaling-stroke"
      />
      {drawing.insets && (
        <path
          d={drawing.insets}
          fill="none"
          stroke={css('border')}
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* Every city, as a small dot. */}
      {cities.map((city) => {
        const xy = drawing.points[city.name];
        if (!xy) return null;
        const on = inFocus.has(city.name);
        return (
          <circle
            key={city.name}
            cx={xy[0]}
            cy={xy[1]}
            r={w * 0.0045}
            fill={css(on ? 'green.700' : 'green.solid')}
            fillOpacity={highlighted == null || on ? 0.7 : 0.25}
            pointerEvents="none"
          />
        );
      })}

      {/* Each area: a halo sized by its count. */}
      {areas.map((area, i) => {
        if (!points[i]) return null;
        const on = highlighted === i;
        return (
          <g key={area.name}>
            <circle
              cx={points[i][0]}
              cy={points[i][1]}
              r={halo(area.count)}
              fill={css('green.solid')}
              fillOpacity={on ? 0.3 : 0.12}
              stroke={css(on ? 'fg' : 'green.solid')}
              strokeWidth={on ? 2 : 1.25}
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
              aria-hidden
              onPointerEnter={() => onFocus(i)}
              onClick={() => onChoose(i)}
            />
            {narrow && (
              <text
                x={points[i][0]}
                y={points[i][1]}
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

      {callouts.map(({ side, y }, i) =>
        points[i] ? (
          <Callout
            key={`callout-${areas[i].name}`}
            area={areas[i]}
            index={i}
            point={points[i]}
            y={y}
            side={side}
            fs={fs}
            columnWidth={columnWidth}
            mapBox={drawing.viewBox}
            most={most}
            on={highlighted === i}
            onFocus={onFocus}
            onChoose={onChoose}
          />
        ) : null
      )}
    </svg>
  );
};

const AreaDetails = ({ area, code, onClose }) => {
  const ref = useRef(null);
  // It opens below the map, possibly out of sight: bring it into view.
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [area.name]);
  return (
    <Box
      ref={ref}
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="bg.panel"
      mt={4}
      aria-live="polite"
    >
      <Flex justify="space-between" align="baseline" gap={3}>
        <Heading as="h4" size="md">
          {areaName(area)}
          <Text as="span" fontWeight="normal" color="fg.muted" fontSize="md">
            {' '}
            · {splitText(area)}
          </Text>
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
      <Stack as="ul" listStyle="none" mt={3} gap={1} fontSize="sm">
        {area.cities.map((city) => (
          <Flex
            as="li"
            key={city.name}
            justify="space-between"
            gap={3}
            maxW="36rem"
            wrap="wrap"
          >
            <Text fontWeight="semibold">{city.name}</Text>
            <Flex gap={3}>
              {city.studios > 0 && (
                <ChakraLink asChild textDecoration="underline">
                  <Link
                    to={`/studios?country=${code}&city=${encodeURIComponent(city.name)}`}
                  >
                    {plural(city.studios, 'studio')}
                  </Link>
                </ChakraLink>
              )}
              {city.associations > 0 && (
                <ChakraLink asChild textDecoration="underline">
                  <Link
                    to={`/associations?country=${code}&city=${encodeURIComponent(city.name)}`}
                  >
                    {plural(city.associations, 'association')}
                  </Link>
                </ChakraLink>
              )}
            </Flex>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};

/** Null when the country has no map or no city with coordinates. */
const CountryMap = ({ code, name, cities }) => {
  const narrow = useNarrow();
  const areas = useMemo(() => areasOf(cities).slice(0, AREAS), [cities]);
  const { drawing, failed } = useDrawing(code, cities, areas);
  const [focused, setFocused] = useState(null);
  const [chosen, setChosen] = useState(null);
  const choose = (i) => setChosen(chosen === i ? null : i);

  if (areas.length === 0 || failed) return null;

  return (
    <Box>
      {drawing ? (
        <MapDrawing
          drawing={drawing}
          cities={cities}
          areas={areas}
          highlighted={focused ?? chosen}
          onFocus={setFocused}
          onChoose={choose}
          narrow={narrow}
        />
      ) : (
        <Skeleton aspectRatio={16 / 9} borderRadius="md" />
      )}
      {narrow && (
        <Stack as="ol" listStyle="none" mt={3} gap={2}>
          {areas.map((area, i) => (
            <li key={area.name}>
              <Box
                as="button"
                type="button"
                textAlign="left"
                onClick={() => choose(i)}
                aria-pressed={chosen === i}
              >
                <Text fontWeight="semibold">
                  {i + 1}. {areaName(area)}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {splitText(area)}
                </Text>
              </Box>
            </li>
          ))}
        </Stack>
      )}
      <Flex justify="space-between" gap={3} wrap="wrap" mt={2} fontSize="sm">
        <Text color="fg.muted">
          The {plural(areas.length, 'biggest area', 'biggest areas')} of{' '}
          {plural(cities.length, 'city', 'cities')}. Choose one for its cities.
        </Text>
        <ChakraLink asChild textDecoration="underline">
          <Link to={`/places?country=${code}`}>Explore {name} on the map</Link>
        </ChakraLink>
      </Flex>
      {chosen != null && (
        <AreaDetails
          area={areas[chosen]}
          code={code}
          onClose={() => setChosen(null)}
        />
      )}
    </Box>
  );
};

export default CountryMap;
