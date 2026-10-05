/**
 * Builds app/assets/continents.json: each ISO country code's continent
 * (AF, AN, AS, EU, NA, OC, SA), for the countries table (#258).
 *
 * Source: the countries-list package (MIT), not a dependency of the app.
 * Usage (when country data changes):
 *   npm install --no-save countries-list@3
 *   node scripts/build-continents.mjs
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';

const { countries } = createRequire(import.meta.url)('countries-list');
const continents = Object.fromEntries(
  Object.entries(countries)
    .map(([code, country]) => [code, country.continent])
    .sort(([a], [b]) => a.localeCompare(b))
);
fs.writeFileSync('app/assets/continents.json', JSON.stringify(continents));
console.log(`${Object.keys(continents).length} countries written.`);
