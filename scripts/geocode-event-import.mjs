#!/usr/bin/env node
/**
 * Places the events of an import file (app/data/imports/*.json) on the map,
 * once, so the file can be reviewed with the places it will create.
 *
 * Each in-person event names its place in `where` ("Berlin, Germany", or a
 * venue with its city). This asks Mapbox for it, as the event form does, and
 * writes `place` beside it: the street, city, region, country code and
 * coordinates, plus Mapbox's own name for it to check against `where`, and
 * the time zone there. Events that already have a `place` are left alone, so
 * a place corrected by hand stays corrected.
 *
 * Usage:
 *   node scripts/geocode-event-import.mjs app/data/imports/<file>.json
 */
import { readFile, writeFile } from 'node:fs/promises';

import { geocodingUrl, placeFromFeature } from '../app/utils/geocoding.js';
import { timeZoneAt } from '../app/utils/timeZone.server.js';

// The site's public token (components/PlaceField).
const TOKEN =
  'pk.eyJ1IjoiaW5kaWVjb2xsZSIsImEiOiJja21qN2dzd2kwb2d3MndxNGs4eGFyeXhnIn0.4kAFQx69wEpXRGPcsGE--Q';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/geocode-event-import.mjs <import file>');
  process.exit(1);
}

const file = JSON.parse(await readFile(path, 'utf8'));
let placed = 0;

for (const event of file.events) {
  if (event.online || event.place || !event.where) continue;
  const url = geocodingUrl(event.where, {
    token: TOKEN,
    types: ['country', 'region', 'place', 'address', 'poi'],
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${event.key}: Mapbox answered ${res.status}`);
  const [feature] = (await res.json()).features;
  if (!feature) {
    console.warn(`${event.key}: nothing found for "${event.where}"`);
    continue;
  }
  const { venueName, ...found } = placeFromFeature(feature);
  event.place = {
    found: feature.place_name,
    ...(venueName && { venue: venueName }),
    street: found.street ?? null,
    city: found.city ?? null,
    region: found.region ?? null,
    country_code: found.countryCode ?? null,
    latitude: found.latitude,
    longitude: found.longitude,
    time_zone: timeZoneAt(found.latitude, found.longitude),
  };
  placed += 1;
  console.log(`${event.key}: ${feature.place_name} (${event.place.time_zone})`);
}

await writeFile(path, `${JSON.stringify(file, null, 2)}\n`);
console.log(`\nPlaced ${placed} events.`);
