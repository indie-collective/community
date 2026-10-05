// The city map on country pages (#258): the country's outline, with its
// cities projected onto it. Loaded in the browser only, so d3 stays out of
// the server bundle.
import {
  geoAlbersUsa,
  geoArea,
  geoBounds,
  geoCentroid,
  geoDistance,
  geoMercator,
  geoPath,
} from 'd3-geo';
// The package's entry point exports nothing under Node (tests), so its
// source modules are imported directly.
import geoConicConformalFrance from 'd3-composite-projections/src/conicConformalFrance.js';
import geoConicConformalPortugal from 'd3-composite-projections/src/conicConformalPortugal.js';
import geoConicConformalSpain from 'd3-composite-projections/src/conicConformalSpain.js';
import { feature } from 'topojson-client';

// Countries with far-off parts that get insets, but only when one of the
// country's cities is out there: otherwise the boxes would sit empty.
const INSETS = {
  FR: geoConicConformalFrance,
  ES: geoConicConformalSpain,
  PT: geoConicConformalPortugal,
};

const WIDTH = 960;
const HEIGHT = 600;
const PAD = 12;

/** The country's outline, from its TopoJSON file (one object per file). */
export function outlineOf(topology) {
  const object = Object.values(topology.objects)[0];
  return feature(topology, object);
}

/**
 * The country's main landmasses: its largest polygon, and those at least 1%
 * its size within 12° of it. Fitting the view to these keeps far-off parts
 * (French Guiana, Svalbard, Japan's Pacific islands) from shrinking the map;
 * cities out there are still kept in view (see drawCityMap).
 */
export function mainland(outline) {
  const features =
    outline.type === 'FeatureCollection' ? outline.features : [outline];
  const polygons = features
    .flatMap(({ geometry }) =>
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates
          : []
    )
    .map((coordinates) => {
      const polygon = { type: 'Polygon', coordinates };
      return { coordinates, area: geoArea(polygon), centre: geoCentroid(polygon) };
    });
  const largest = polygons.reduce((a, b) => (b.area > a.area ? b : a));
  const near = (12 * Math.PI) / 180;
  return {
    type: 'MultiPolygon',
    coordinates: polygons
      .filter(
        (p) =>
          p.area >= largest.area / 100 &&
          geoDistance(p.centre, largest.centre) <= near
      )
      .map((p) => p.coordinates),
  };
}

/** Whether any city lies more than 2° outside the mainland's box. */
function citiesOverseas(main, cities) {
  const [[w, s], [e, n]] = geoBounds(main);
  return cities.some(
    ({ lat, lng }) => lat < s - 2 || lat > n + 2 || lng < w - 2 || lng > e + 2
  );
}

/**
 * The map: a view box, the outline's path, the inset frames if any, and
 * each placed city's position by name. Countries crossing the antimeridian
 * (Russia, Fiji…) are centred on themselves first.
 */
export function drawCityMap(code, topology, cities) {
  const outline = outlineOf(topology);
  const main = mainland(outline);
  const placed = cities.filter((c) => c.lat != null && c.lng != null);

  let projection;
  let viewBox;
  if (code === 'US' || (INSETS[code] && citiesOverseas(main, placed))) {
    const make = code === 'US' ? geoAlbersUsa : INSETS[code];
    projection = make().fitExtent(
      [
        [PAD, PAD],
        [WIDTH - PAD, HEIGHT - PAD],
      ],
      outline
    );
    viewBox = [0, 0, WIDTH, HEIGHT];
  } else {
    const [[w], [e]] = geoBounds(main);
    const centre = w + ((e - w + 360) % 360) / 2;
    // The mainland, and any city beyond it, so no city falls off the map.
    const view = {
      type: 'GeometryCollection',
      geometries: [
        main,
        { type: 'MultiPoint', coordinates: placed.map((c) => [c.lng, c.lat]) },
      ],
    };
    projection = geoMercator()
      .rotate([-centre, 0])
      .fitSize([WIDTH, HEIGHT], view);
    const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(view);
    viewBox = [x0 - PAD, y0 - PAD, x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD];
  }

  const points = {};
  for (const city of placed) {
    const xy = projection([city.lng, city.lat]);
    if (xy && Number.isFinite(xy[0]) && Number.isFinite(xy[1]))
      points[city.name] = xy;
  }

  return {
    viewBox: viewBox.map((n) => Math.round(n)),
    outline: geoPath(projection)(outline),
    // The lines framing the insets (a d3 path, so stringified).
    insets: projection.getCompositionBorders
      ? String(projection.getCompositionBorders())
      : null,
    points,
  };
}
