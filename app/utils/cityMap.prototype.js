// PROTOTYPE (country city map, #257): the country's outline with its cities
// projected onto it. Throwaway; loaded in the browser only.
import { geoMercator, geoPath, geoBounds, geoAlbersUsa } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import geoConicConformalFrance from 'd3-composite-projections/src/conicConformalFrance.js';
import geoConicConformalPortugal from 'd3-composite-projections/src/conicConformalPortugal.js';
import geoConicConformalSpain from 'd3-composite-projections/src/conicConformalSpain.js';

import { mainland } from './regionMap';

const COMPOSITE = { FR: geoConicConformalFrance, ES: geoConicConformalSpain, PT: geoConicConformalPortugal, US: geoAlbersUsa };

export function prepare(code, topology, cities) {
  const object = Object.values(topology.objects)[0];
  const regions = feature(topology, object).features;
  const outline = merge(topology, object.geometries);
  const pad = 12;
  let projection;
  let viewBox;
  if (COMPOSITE[code]) {
    projection = COMPOSITE[code]().fitExtent([[pad, pad], [960 - pad, 600 - pad]], outline);
    viewBox = [0, 0, 960, 600];
  } else {
    const main = mainland(regions);
    const [[w], [e]] = geoBounds(main);
    projection = geoMercator().rotate([-(w + ((e - w + 360) % 360) / 2), 0]).fitSize([960, 600], main);
    const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(main);
    viewBox = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
  }
  const path = geoPath(projection);
  return {
    viewBox,
    outline: path(outline),
    insets: projection.getCompositionBorders ? String(projection.getCompositionBorders()) : null,
    points: Object.fromEntries(
      cities
        .filter((c) => c.lat != null)
        .map((c) => [c.name, projection([c.lng, c.lat])])
        .filter(([, xy]) => xy && Number.isFinite(xy[0]))
    ),
  };
}
