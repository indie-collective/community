#!/usr/bin/env node
/**
 * Give every event its own time zone, and fix the times of events outside
 * the zone they were saved in (#204).
 *
 * Until now the event form sent wall-clock times without an offset, and the
 * server read them in its own time zone, production's being Europe/Paris. So
 * "19:00" typed for a Kyoto event was stored as 19:00 Paris time. This sets
 * each event's `time_zone` from its location, and re-reads its start and end
 * as wall-clock times in that zone: the 19:00 becomes 19:00 Kyoto time. Events
 * in the Paris zone keep their times.
 *
 * Usage:
 *   DATABASE_URL=… node scripts/backfill-event-time-zones.mjs [--write] [--saved-zone Europe/Paris]
 *
 * - Dry run by default: prints each change and writes nothing. --write applies.
 * - --saved-zone is the zone the server ran in when the events were saved
 *   (Europe/Paris unless you know otherwise; check before writing).
 * - Events without a location get the default zone and keep their times.
 * - Re-running is safe: events whose zone is already set to their location's
 *   zone are skipped.
 */
import { PrismaClient } from '@prisma/client';

import { DEFAULT_TIME_ZONE, dateToZonedInput, zonedInputToDate } from '../app/utils/eventTime.js';
import { timeZoneAt } from '../app/utils/timeZone.server.js';

const args = process.argv.slice(2);
const write = args.includes('--write');
const savedZoneIndex = args.indexOf('--saved-zone');
const savedZone = savedZoneIndex >= 0 ? args[savedZoneIndex + 1] : 'Europe/Paris';

const db = new PrismaClient();

async function main() {
  const events = await db.event.findMany({
    select: { id: true, name: true, starts_at: true, ends_at: true, time_zone: true, location: { select: { latitude: true, longitude: true } } },
    orderBy: { starts_at: 'asc' },
  });

  console.log(`${write ? 'Updating' : 'Dry run over'} ${events.length} events (times were saved as ${savedZone})…\n`);
  const counts = { zoneOnly: 0, retimed: 0, unchanged: 0 };

  for (const event of events) {
    const zone = event.location ? timeZoneAt(event.location.latitude, event.location.longitude) : DEFAULT_TIME_ZONE;
    if (zone === event.time_zone && event.time_zone !== DEFAULT_TIME_ZONE) {
      counts.unchanged += 1;
      continue;
    }

    // Read the stored instants back as the wall-clock times that were typed,
    // then as wall-clock times in the event's own zone: shift each by the
    // difference between the two zones' offsets at that time, which keeps
    // seconds and milliseconds.
    const retime = (date) => {
      const wall = dateToZonedInput(date, savedZone);
      const shift = zonedInputToDate(wall, zone).getTime() - zonedInputToDate(wall, savedZone).getTime();
      return new Date(date.getTime() + shift);
    };
    const starts_at = retime(event.starts_at);
    const ends_at = retime(event.ends_at);
    const moved = starts_at.getTime() !== event.starts_at.getTime() || ends_at.getTime() !== event.ends_at.getTime();

    if (!moved && zone === event.time_zone) {
      counts.unchanged += 1;
      continue;
    }

    if (moved) {
      counts.retimed += 1;
      console.log(
        `${event.id}  ${event.name}\n    ${zone}: ${dateToZonedInput(event.starts_at, savedZone)} stays ${dateToZonedInput(starts_at, zone)} local` +
          ` (${event.starts_at.toISOString()} → ${starts_at.toISOString()})`
      );
    } else {
      counts.zoneOnly += 1;
    }

    if (write) {
      await db.event.update({ where: { id: event.id }, data: { time_zone: zone, starts_at, ends_at } });
    }
  }

  console.log(
    `\n${counts.retimed} events retimed, ${counts.zoneOnly} given a zone with unchanged times, ${counts.unchanged} already right.` +
      (write ? '' : '\nNothing was written: run again with --write to apply.')
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
