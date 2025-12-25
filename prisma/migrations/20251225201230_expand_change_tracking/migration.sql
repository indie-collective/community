/*
  Warnings:

  - You are about to drop the `game_change` table. If the table is not empty, all the data it contains will be lost.

*/

-- CreateTable
CREATE TABLE "change" (
    "operation" "operation_type" NOT NULL,
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "table_name" TEXT NOT NULL,
    "record_id" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "author_id" UUID,

    CONSTRAINT "change_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "change" ADD CONSTRAINT "change_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- MigrateData
INSERT INTO "change" (operation, id, table_name, record_id, data, created_at, author_id)
SELECT 
    operation,
    id,
    'game',
    game_id,
    jsonb_build_object(
        'name', name,
        'about', about,
        'igdb_slug', igdb_slug,
        'site', site,
        'tag_list', tag_list
    ),
    created_at,
    author_id
FROM "game_change";

-- DropForeignKey
ALTER TABLE "game_change" DROP CONSTRAINT "game_change_author_id_fkey";

-- DropForeignKey
ALTER TABLE "game_change" DROP CONSTRAINT "game_change_game_id_fkey";

-- DropTable
DROP TABLE "game_change";

-- AlterTable
ALTER TABLE "entity" ADD COLUMN     "lastModifiedById" UUID;

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "lastModifiedById" UUID;

-- CreateFunction
CREATE OR REPLACE FUNCTION process_change() RETURNS TRIGGER AS $change$
    DECLARE
        tbl_name text;
        author_id uuid;
        data jsonb;
    BEGIN
        tbl_name := TG_TABLE_NAME;
        
        -- Try to get author from new record or fallback/session if needed
        -- This relies on the application setting lastModifiedById before commit
        IF (TG_OP = 'DELETE') THEN
            -- For deletes, we might not have a reliable way to know WHO deleted it unless we soft-delete or track it elsewhere.
            -- Using current_setting if available, or NULL.
            BEGIN
                author_id := current_setting('request.jwt.claim.sub', true)::uuid;
            EXCEPTION WHEN OTHERS THEN
                author_id := NULL;
            END;
            data := row_to_json(OLD)::jsonb;
            
            INSERT INTO change (operation, table_name, record_id, data, created_at, author_id)
            VALUES ('delete', tbl_name, OLD.id, data, now(), author_id);
            
        ELSIF (TG_OP = 'UPDATE') THEN
           IF (NEW."lastModifiedById" IS NOT NULL) THEN
               author_id := NEW."lastModifiedById";
           ELSE
               -- distinct lack of author
               author_id := NULL;
           END IF;
           
           data := row_to_json(NEW)::jsonb;
           
           INSERT INTO change (operation, table_name, record_id, data, created_at, author_id)
           VALUES ('update', tbl_name, NEW.id, data, now(), author_id);
           
        ELSIF (TG_OP = 'INSERT') THEN
           IF (NEW."lastModifiedById" IS NOT NULL) THEN
               author_id := NEW."lastModifiedById";
           ELSE
               author_id := NULL;
           END IF;

           data := row_to_json(NEW)::jsonb;

           INSERT INTO change (operation, table_name, record_id, data, created_at, author_id)
           VALUES ('create', tbl_name, NEW.id, data, now(), author_id);
        END IF;
        RETURN NULL;
    END;
$change$ LANGUAGE plpgsql;

-- CreateTriggers
DROP TRIGGER IF EXISTS game_change ON game;
CREATE TRIGGER game_change
AFTER INSERT OR UPDATE OR DELETE ON game
    FOR EACH ROW EXECUTE FUNCTION process_change();

CREATE TRIGGER entity_change
AFTER INSERT OR UPDATE OR DELETE ON entity
    FOR EACH ROW EXECUTE FUNCTION process_change();

CREATE TRIGGER event_change
AFTER INSERT OR UPDATE OR DELETE ON event
    FOR EACH ROW EXECUTE FUNCTION process_change();

DROP FUNCTION IF EXISTS process_game_change();
