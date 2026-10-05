// Region maps on country pages (#73). Loaded in the browser only, so d3
// stays out of the server bundle.
import {
  geoAlbersUsa,
  geoArea,
  geoBounds,
  geoContains,
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

// Countries with far-off parts get insets (overseas regions, islands).
const COMPOSITE = {
  FR: geoConicConformalFrance,
  ES: geoConicConformalSpain,
  PT: geoConicConformalPortugal,
  US: geoAlbersUsa,
};

// Simplified borders can leave coastal cities just offshore: a point that no
// region contains goes to the nearest region within this distance.
const NEAR_ENOUGH = 40 / 6371; // 40 km, in radians

/** The regions of a country's TopoJSON file (one object per file). */
export function regionsOf(topology) {
  const object = Object.values(topology.objects)[0];
  return feature(topology, object).features;
}

/**
 * How many organisations each region holds, from their coordinates.
 * `points` are { lng, lat, count }. Returns the counts in `regions` order,
 * and how many organisations couldn't be placed.
 */
export function countByRegion(regions, points) {
  const counts = regions.map(() => 0);
  const centres = regions.map((region) => {
    const [[w, s], [e, n]] = geoBounds(region);
    return [w + ((e - w + 360) % 360) / 2, (s + n) / 2];
  });
  let unplaced = 0;
  for (const { lng, lat, count = 1 } of points) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      unplaced += count;
      continue;
    }
    let index = regions.findIndex((region) => geoContains(region, [lng, lat]));
    if (index === -1) {
      // The region with the closest outline vertex, if close enough.
      let best = Infinity;
      regions.forEach((region, i) => {
        const d = distanceToOutline(region, [lng, lat], centres[i]);
        if (d < best) [best, index] = [d, i];
      });
      if (best > NEAR_ENOUGH) index = -1;
    }
    if (index === -1) unplaced += count;
    else counts[index] += count;
  }
  return { counts, unplaced };
}

function distanceToOutline(region, point, centre) {
  // Skip regions whose centre is over 30° away: none is that big.
  if (geoDistance(point, centre) > Math.PI / 6) return Infinity;
  let best = Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      best = Math.min(best, geoDistance(point, coords));
    } else coords.forEach(visit);
  };
  visit(region.geometry.coordinates);
  return best;
}

/**
 * Up to `max` classes for the non-zero counts, as ascending upper bounds:
 * [2, 5, 20] means 1–2, 3–5, 6–20. Quantile breaks, so one big city doesn't
 * leave every other region in the lightest class.
 */
export function classify(counts, max = 5) {
  const values = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (values.length === 0) return [];
  const bounds = [];
  for (let k = 1; k <= max; k += 1) {
    const value =
      values[
        Math.min(values.length - 1, Math.ceil((k / max) * values.length) - 1)
      ];
    if (bounds.at(-1) !== value) bounds.push(value);
  }
  return bounds;
}

/** 0 for none, else the 1-based class of `count`. */
export function classOf(count, bounds) {
  if (count <= 0) return 0;
  const index = bounds.findIndex((bound) => count <= bound);
  return (index === -1 ? bounds.length - 1 : index) + 1;
}

/** Labels for the legend, e.g. ["1–2", "3–5", "6–20"]. */
export function classLabels(bounds) {
  return bounds.map((bound, i) => {
    const from = i === 0 ? 1 : bounds[i - 1] + 1;
    return from === bound ? `${bound}` : `${from}–${bound}`;
  });
}

/**
 * The country's main landmasses: polygons at least 1% the size of its
 * largest. Fitting the view to these keeps far-off specks (Japan's Pacific
 * islands, Norway's Bouvet Island) from shrinking the map.
 */
export function mainland(regions) {
  const polygons = regions.flatMap(({ geometry }) =>
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : []
  );
  const areas = polygons.map((coordinates) =>
    geoArea({ type: 'Polygon', coordinates })
  );
  const largest = Math.max(...areas);
  return {
    type: 'MultiPolygon',
    coordinates: polygons.filter((_, i) => areas[i] >= largest / 100),
  };
}

/**
 * SVG paths for the regions, fitted to a 960-wide view whose height follows
 * the country's shape. Countries crossing the antimeridian (Russia, Fiji…)
 * are centred on themselves first. Countries drawn with insets keep the
 * projection's whole frame, insets included.
 */
export function drawRegions(code, regions) {
  const collection = { type: 'FeatureCollection', features: regions };
  const pad = 8;
  if (COMPOSITE[code]) {
    const projection = COMPOSITE[code]().fitExtent(
      [
        [pad, pad],
        [960 - pad, 600 - pad],
      ],
      collection
    );
    const path = geoPath(projection);
    return {
      viewBox: '0 0 960 600',
      paths: regions.map((region) => path(region)),
      // The lines framing the insets (a d3 path, so stringified).
      insets: projection.getCompositionBorders
        ? String(projection.getCompositionBorders())
        : null,
    };
  }

  const main = mainland(regions);
  const [[w], [e]] = geoBounds(main);
  const centre = w + ((e - w + 360) % 360) / 2;
  const projection = geoMercator()
    .rotate([-centre, 0])
    .fitSize([960, 600], main);
  const path = geoPath(projection);
  const [[x0, y0], [x1, y1]] = path.bounds(main);
  return {
    viewBox: [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]
      .map((n) => Math.round(n))
      .join(' '),
    paths: regions.map((region) => path(region)),
    insets: null,
  };
}
