ALTER TABLE "game" DROP COLUMN IF EXISTS "tag_list";
ALTER TABLE "game_change" DROP COLUMN IF EXISTS "tag_list";
ALTER TABLE "tag" ADD COLUMN "description" TEXT;
