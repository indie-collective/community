-- #204: event times are shown and entered in the event's own time zone.
-- Existing events default to Europe/Paris, the zone the production server
-- ran in when they were saved; scripts/backfill-event-time-zones.mjs then sets
-- each event's zone from its location and corrects its stored times.
ALTER TABLE "event" ADD COLUMN "time_zone" VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris';
