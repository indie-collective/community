/**
 * Builds the country outlines for country pages' city maps (#258): one
 * small TopoJSON file per country in public/maps/ (e.g. FR.json), holding
 * the country's outline, with no internal borders. Drawn in the browser,
 * with the country's cities on top.
 *
 * Source: Natural Earth 1:10m admin-1 (states, provinces), public domain:
 * https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
 * Admin-1 rather than admin-0 because it carries ISO country codes for
 * overseas parts (France's include Réunion, for example).
 *
 * Usage (once, or when Natural Earth updates):
 *   curl -LO https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
 *   unzip ne_10m_admin_1_states_provinces.zip -d ne
 *   node scripts/build-country-maps.mjs ne/ne_10m_admin_1_states_provinces.shp
 *
 * Runs mapshaper through npx (pinned below); nothing is added to the app.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MAPSHAPER = 'mapshaper@0.6.121';
const OUT = 'public/maps';

const [, , source] = process.argv;
if (!source || !fs.existsSync(source)) {
  console.error('Usage: node scripts/build-country-maps.mjs path/to/ne_10m_admin_1_states_provinces.shp');
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

execFileSync(
  'npx',
  [
    '-y', MAPSHAPER, source,
    // Natural Earth marks some territories' features with iso_a2 "-1" or "-99".
    '-filter', '/^[A-Z]{2}$/.test(iso_a2)',
    '-each', 'country = iso_a2',
    '-dissolve', 'country',
    '-split', 'country',
    // Simplified per country, for the size the map is shown at.
    '-simplify', 'target=*', 'resolution=4000x4000', 'keep-shapes',
    '-clean', 'target=*',
    '-each', 'delete country', 'target=*',
    '-o', `${OUT}/`, 'format=topojson', 'quantization=10000', 'singles',
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] }
);

// mapshaper names each file after the split value, e.g. FR.json. The list
// lets the server know which countries have a map without reading files.
const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.json'));
fs.writeFileSync(
  'app/assets/countryMaps.json',
  JSON.stringify(files.map((f) => f.replace('.json', '')).sort()) + '\n'
);
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`${files.length} country maps in ${OUT}, ${(bytes / 1024).toFixed(0)} KB in all.`);
