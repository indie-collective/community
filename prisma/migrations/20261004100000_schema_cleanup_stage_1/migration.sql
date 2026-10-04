-- #150 schema cleanup, stage 1: remove what's unused, add #39 / #40, index.
--
-- Removed (decided on #150):
--   tables entity_image, entity_member, game_author, reset_token
--   columns game.tag_list, game_event.tags, person.github_id, person.steam_id,
--   person.password_hash (passwords are dropped; sign-in moves to Bluesky)
-- Added: entity.status (#39), game_entity.role (#40), with defaults.
-- Indexes on foreign keys and filtered columns (Postgres doesn't add them).
--
-- Drops use IF EXISTS / CASCADE so they don't depend on constraint names.

-- CreateEnum
CREATE TYPE "entity_status" AS ENUM ('active', 'closed', 'hiatus');

-- CreateEnum
CREATE TYPE "game_entity_role" AS ENUM ('developer', 'co_developer', 'publisher', 'porting', 'support');

-- DropIndex
DROP INDEX IF EXISTS "person_github_id_key";

-- DropIndex
DROP INDEX IF EXISTS "person_steam_id_key";

-- AlterTable
ALTER TABLE "entity" ADD COLUMN     "status" "entity_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "game" DROP COLUMN IF EXISTS "tag_list";

-- AlterTable
ALTER TABLE "game_entity" ADD COLUMN     "role" "game_entity_role" NOT NULL DEFAULT 'developer';

-- AlterTable
ALTER TABLE "game_event" DROP COLUMN IF EXISTS "tags";

-- AlterTable
ALTER TABLE "person" DROP COLUMN IF EXISTS "github_id",
DROP COLUMN IF EXISTS "password_hash",
DROP COLUMN IF EXISTS "steam_id";

-- DropTable
DROP TABLE IF EXISTS "entity_image" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "entity_member" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "game_author" CASCADE;

-- DropTable
DROP TABLE IF EXISTS "reset_token" CASCADE;

-- CreateIndex
CREATE INDEX "entity_location_id_idx" ON "entity"("location_id");

-- CreateIndex
CREATE INDEX "entity_logo_id_idx" ON "entity"("logo_id");

-- CreateIndex
CREATE INDEX "entity_type_idx" ON "entity"("type");

-- CreateIndex
CREATE INDEX "entity_event_event_id_idx" ON "entity_event"("event_id");

-- CreateIndex
CREATE INDEX "event_location_id_idx" ON "event"("location_id");

-- CreateIndex
CREATE INDEX "event_cover_id_idx" ON "event"("cover_id");

-- CreateIndex
CREATE INDEX "event_starts_at_idx" ON "event"("starts_at");

-- CreateIndex
CREATE INDEX "event_participant_person_id_idx" ON "event_participant"("person_id");

-- CreateIndex
CREATE INDEX "game_deleted_idx" ON "game"("deleted");

-- CreateIndex
CREATE INDEX "change_table_name_record_id_idx" ON "change"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "game_entity_entity_id_idx" ON "game_entity"("entity_id");

-- CreateIndex
CREATE INDEX "game_event_event_id_idx" ON "game_event"("event_id");

-- CreateIndex
CREATE INDEX "game_image_image_id_idx" ON "game_image"("image_id");

-- CreateIndex
CREATE INDEX "game_tag_tag_id_idx" ON "game_tag"("tag_id");

-- CreateIndex
CREATE INDEX "location_country_code_idx" ON "location"("country_code");

-- CreateIndex
CREATE INDEX "person_avatar_id_idx" ON "person"("avatar_id");
