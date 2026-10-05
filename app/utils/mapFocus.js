// Where /places opens when given a country (#258): the area most of the
// country's organisations are in, and the zoom that fits it.

const quantile = (sorted, q) =>
  sorted[
    Math.min(
      sorted.length - 1,
      Math.max(0, Math.round(q * (sorted.length - 1)))
    )
  ];

/**
 * The box around `points` ({ latitude, longitude }), as { sw, ne, center }
 * in [lat, lng]. With enough points, the outer 5% on each side are left
 * out, so a few far-off places (overseas regions) don't zoom the map out
 * to the whole world. Null without points.
 */
export function focusOn(points) {
  const placed = points.filter(
    (p) => Number.isFinite(p?.latitude) && Number.isFinite(p?.longitude)
  );
  if (placed.length === 0) return null;
  const trim = placed.length >= 20 ? 0.05 : 0;
  const lats = placed.map((p) => p.latitude).sort((a, b) => a - b);
  const lngs = placed.map((p) => p.longitude).sort((a, b) => a - b);
  const sw = [quantile(lats, trim), quantile(lngs, trim)];
  const ne = [quantile(lats, 1 - trim), quantile(lngs, 1 - trim)];
  return { sw, ne, center: [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2] };
}

const mercatorY = (lat) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** The web-map zoom at which the box fits a map of `width` × `height` pixels. */
export function zoomToFit(
  { sw, ne },
  { width, height },
  { max = 12, margin = 0.4 } = {}
) {
  const lngShare = (ne[1] - sw[1]) / 360;
  const latShare = (mercatorY(ne[0]) - mercatorY(sw[0])) / (2 * Math.PI);
  if (lngShare <= 0 && latShare <= 0) return max; // a single place
  const zoom = Math.min(
    lngShare > 0 ? Math.log2(width / 256 / lngShare) : max,
    latShare > 0 ? Math.log2(height / 256 / latShare) : max
  );
  return Math.max(1, Math.min(max, zoom - margin));
}
