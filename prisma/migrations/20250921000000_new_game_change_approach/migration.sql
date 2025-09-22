-- AlterTable
ALTER TABLE "game" ADD COLUMN "lastModifiedById" UUID;

-- UpdateTriggerFunction
CREATE OR REPLACE FUNCTION process_game_change() RETURNS TRIGGER AS $game_change$
    BEGIN
        IF (TG_OP = 'UPDATE' AND NEW.deleted IS TRUE) THEN
            INSERT INTO game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) SELECT 'delete', now(), OLD.lastModifiedById, OLD.id, OLD.name, OLD.about, OLD.igdb_slug, OLD.site;
        ELSIF (TG_OP = 'UPDATE') THEN
            insert into game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) select 'update', now(), NEW.lastModifiedById, NEW.id, NEW.name, NEW.about, NEW.igdb_slug, NEW.site;
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO game_change (operation, created_at, author_id, game_id, name, about, igdb_slug, site) SELECT 'create', now(), NEW.lastModifiedById, NEW.id, NEW.name, NEW.about, NEW.igdb_slug, NEW.site;
        END IF;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$game_change$ LANGUAGE plpgsql;