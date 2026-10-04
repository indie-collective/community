-- #161: an organisation's Bluesky handle (e.g. studio.bsky.social).
ALTER TABLE "entity" ADD COLUMN "bsky_handle" VARCHAR(253);
