-- AlterTable
ALTER TABLE "game" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "operation_type" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "game_change" (
    "operation" "operation_type" NOT NULL,
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "name" TEXT,
    "about" TEXT,
    "igdb_slug" TEXT,
    "site" TEXT,
    "tag_list" VARCHAR(30)[],
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "game_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,

    CONSTRAINT "game_change_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_change" ADD CONSTRAINT "game_change_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_change" ADD CONSTRAINT "game_change_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION process_game_change() RETURNS TRIGGER AS $game_change$
    BEGIN
        IF (TG_OP = 'UPDATE' AND NEW.deleted IS TRUE) THEN
            INSERT INTO game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) SELECT 'delete', now(), current_setting('indieco.current_user_id')::uuid, OLD.id, OLD.name, OLD.about, OLD.igdb_slug, OLD.site;
        ELSIF (TG_OP = 'UPDATE') THEN
            insert into game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) select 'update', now(), current_setting('indieco.current_user_id')::uuid, NEW.id, NEW.name, NEW.about, NEW.igdb_slug, NEW.site;
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) SELECT 'create', now(), current_setting('indieco.current_user_id')::uuid, NEW.id, NEW.name, NEW.about, NEW.igdb_slug, NEW.site;
        END IF;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$game_change$ LANGUAGE plpgsql;

CREATE TRIGGER game_change
AFTER INSERT OR UPDATE OR DELETE ON game
    FOR EACH ROW EXECUTE FUNCTION process_game_change();