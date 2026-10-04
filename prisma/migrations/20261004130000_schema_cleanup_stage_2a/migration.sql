-- #150 schema cleanup, stage 2a: usernames and IDs without database extensions.
--
-- Usernames for new people are generated in the app (createPerson), so the
-- trigger and the slugify() function, which needed `unaccent`, go.
DROP TRIGGER IF EXISTS "generate_username" ON "person";
DROP FUNCTION IF EXISTS set_default_username();
DROP FUNCTION IF EXISTS slugify(TEXT);

-- IDs default to gen_random_uuid(), built into Postgres 13+, instead of
-- uuid-ossp's uuid_generate_v4(). Raw SQL inserts keep working.
ALTER TABLE "entity" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "event" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "game" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "change" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "image" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "location" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "person" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "tag" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- The extensions themselves stay installed: on Supabase they live in a
-- shared schema that its own services may use. Nothing here depends on
-- them any more; they go with the move to D1 (#151).
