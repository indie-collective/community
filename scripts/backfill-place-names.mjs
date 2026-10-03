#!/usr/bin/env node
/**
 * Re-geocode every location's city and region in English (#208).
 *
 * Locations were saved with Mapbox's local-language names ("Warszawa",
 * "京都市") because the picker didn't ask for a language. This looks each
 * one up again from its coordinates, with `language=en`.
 *
 * Usage:
 *   MAPBOX_TOKEN=pk.… DATABASE_URL=… node scripts/backfill-place-names.mjs [--write] [--limit N]
 *
 * - Dry run by default: prints every change (before → after) and writes
 *   nothing. Pass --write to apply.
 * - --limit N looks at the first N locations only (handy for a trial run).
 * - Skips locations without coordinates, and lookups that fail or return
 *   no names (they're logged), and keeps a name when English has none.
 * - Renaming can make two rows identical on the unique key (street, city,
 *   region, country, coordinates). The renamed row is then merged into the
 *   existing one: its orgs and events are re-pointed, and it's deleted.
 * - Paces requests (~5 per second) to stay well inside Mapbox's limits.
 */
import { PrismaClient } from '@prisma/client';

import { geocodingUrl, placeNames } from '../app/utils/geocoding.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : undefined;

const token = process.env.MAPBOX_TOKEN;
if (!token) {
  console.error('MAPBOX_TOKEN is required (the public pk.… token the location picker uses).');
  process.exit(1);
}

const db = new PrismaClient();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function lookup({ latitude, longitude }) {
  const url = geocodingUrl([longitude, latitude], { token, types: ['place', 'region'] });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mapbox answered ${response.status}`);
  const { features } = await response.json();
  return placeNames(features);
}

async function main() {
  const locations = await db.location.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    orderBy: { id: 'asc' },
    take: limit,
  });

  console.log(`${write ? 'Updating' : 'Dry run over'} ${locations.length} locations…\n`);
  const counts = { changed: 0, unchanged: 0, merged: 0, skipped: 0 };

  for (const location of locations) {
    let names;
    try {
      names = await lookup(location);
    } catch (error) {
      console.warn(`skip ${location.id}: ${error.message}`);
      counts.skipped += 1;
      continue;
    } finally {
      await pause(200);
    }

    const city = names.city ?? location.city;
    const region = names.region ?? location.region;
    if (!names.city && !names.region) {
      console.warn(`skip ${location.id}: no names for ${location.latitude},${location.longitude}`);
      counts.skipped += 1;
      continue;
    }
    if (city === location.city && region === location.region) {
      counts.unchanged += 1;
      continue;
    }

    console.log(`${location.id}  ${location.city ?? '—'}, ${location.region ?? '—'}  →  ${city ?? '—'}, ${region ?? '—'}`);
    counts.changed += 1;
    if (!write) continue;

    const twin = await db.location.findFirst({
      where: {
        id: { not: location.id },
        street: location.street,
        city,
        region,
        country_code: location.country_code,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    if (twin) {
      await db.$transaction([
        db.entity.updateMany({ where: { location_id: location.id }, data: { location_id: twin.id } }),
        db.event.updateMany({ where: { location_id: location.id }, data: { location_id: twin.id } }),
        db.location.delete({ where: { id: location.id } }),
      ]);
      console.log(`  merged into ${twin.id}`);
      counts.merged += 1;
    } else {
      await db.location.update({ where: { id: location.id }, data: { city, region } });
    }
  }

  console.log(
    `\n${counts.changed} to rename${write ? ` (${counts.merged} merged)` : ''}, ${counts.unchanged} already right, ${counts.skipped} skipped.` +
      (write ? '' : '\nNothing was written: run again with --write to apply.')
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
