/**
 * Builds the region maps for country pages (#73): one small TopoJSON file
 * per country in public/maps/ (e.g. FR.json), holding one object whose
 * features have a `name`. Drawn in the browser; organisations are counted per region from
 * their coordinates, so stored region names don't need to match.
 *
 * Source: Natural Earth 1:10m admin-1 (states, provinces), public domain:
 * https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
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
import os from 'node:os';
import path from 'node:path';

const MAPSHAPER = 'mapshaper@0.6.121';
const OUT = 'public/maps';

// Where Natural Earth's subdivisions are finer than the regions people use,
// group them: France's départements into régions, Spain's and Italy's
// provinces into communities and regions, the UK's counties into nations.
const GROUP_BY = { FR: 'region', ES: 'region', IT: 'region', PH: 'region', GB: 'geonunit' };

// English names for groups that Natural Earth names locally or abbreviates.
const GROUP_NAMES = {
  'Auvergne-Rhône-Alpes': 'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté': 'Burgundy-Franche-Comté',
  Bretagne: 'Brittany',
  'Centre-Val de Loire': 'Centre-Val de Loire',
  Corse: 'Corsica',
  'Grand Est': 'Grand Est',
  'Hauts-de-France': 'Hauts-de-France',
  'Île-de-France': 'Île-de-France',
  Normandie: 'Normandy',
  'Nouvelle-Aquitaine': 'Nouvelle-Aquitaine',
  Occitanie: 'Occitania',
  'Pays de la Loire': 'Pays de la Loire',
  "Provence-Alpes-Côte-d'Azur": "Provence-Alpes-Côte d'Azur",
  'Canary Is.': 'Canary Islands',
  'Islas Baleares': 'Balearic Islands',
  'Castilla y León': 'Castile and León',
  'Castilla-La Mancha': 'Castilla–La Mancha',
  Cataluña: 'Catalonia',
  'Comunidad de Madrid': 'Community of Madrid',
  'Comunidad Valenciana': 'Valencian Community',
  'País Vasco': 'Basque Country',
  'Región de Murcia': 'Region of Murcia',
  Andalucía: 'Andalusia',
  Aragón: 'Aragon',
  'Foral de Navarra': 'Navarre',
  'Guyane française': 'French Guiana',
};

const [, , source] = process.argv;
if (!source || !fs.existsSync(source)) {
  console.error('Usage: node scripts/build-country-maps.mjs path/to/ne_10m_admin_1_states_provinces.shp');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'country-maps-'));
const config = path.join(tmp, 'config.cjs');
fs.writeFileSync(config, `module.exports = ${JSON.stringify({ GROUP_BY, GROUP_NAMES })};`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

execFileSync(
  'npx',
  [
    '-y', MAPSHAPER, source,
    '-require', config, 'alias=cfg',
    // Natural Earth marks some territories' features with iso_a2 "-1" or "-99".
    '-filter', '/^[A-Z]{2}$/.test(iso_a2)',
    '-each', [
      'var by = cfg.GROUP_BY[iso_a2];',
      'var group = by ? this.properties[by] : "";',
      'name = group ? (cfg.GROUP_NAMES[group] || group) : (name_en || name);',
      'country = iso_a2;',
    ].join(' '),
    '-dissolve', 'country,name',
    '-filter-fields', 'country,name',
    '-split', 'country',
    // Simplified per country, for the size the map is shown at (960 wide).
    '-simplify', 'target=*', 'resolution=4000x4000', 'keep-shapes',
    '-clean', 'target=*',
    '-each', 'delete country', 'target=*',
    '-o', `${OUT}/`, 'format=topojson', 'quantization=10000', 'singles',
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] }
);
fs.rmSync(tmp, { recursive: true, force: true });

// mapshaper names each file after the split value, e.g. FR.json. The list
// lets the server know which countries have a map without reading files.
const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.json'));
fs.writeFileSync(
  'app/assets/countryMaps.json',
  JSON.stringify(files.map((f) => f.replace('.json', '')).sort()) + '\n'
);
const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`${files.length} country maps in ${OUT}, ${(bytes / 1024).toFixed(0)} KB in all.`);
