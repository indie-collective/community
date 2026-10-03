-- #207: merge spelling and translation variants of tags into one canonical
-- tag, and remember the variants as aliases so new input maps to it.

-- An alias (a variant spelling) and the tag it stands for.
CREATE TABLE "tag_alias" (
    "alias" VARCHAR(30) NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_alias_pkey" PRIMARY KEY ("alias"),
    CONSTRAINT "tag_alias_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Merges tag `variant` into tag `canonical` (created if missing): its games
-- get the canonical tag (once), the variant is deleted and becomes an alias.
-- Safe to re-run. Without the variant, it only records the alias (when the
-- canonical tag exists). Also usable later,
-- e.g. SELECT merge_tag_variant('multi', 'multiplayer');
CREATE OR REPLACE FUNCTION merge_tag_variant(variant TEXT, canonical TEXT) RETURNS VOID AS $$
DECLARE
    variant_id UUID;
    canonical_id UUID;
BEGIN
    IF variant = canonical THEN
        RETURN;
    END IF;

    SELECT id INTO variant_id FROM tag WHERE name = variant;
    IF variant_id IS NULL THEN
        -- Nothing to merge; still map future input if the tag exists.
        INSERT INTO tag_alias (alias, tag_id)
            SELECT variant, id FROM tag WHERE name = canonical
            ON CONFLICT (alias) DO UPDATE SET tag_id = EXCLUDED.tag_id;
        RETURN;
    END IF;

    INSERT INTO tag (name) VALUES (canonical) ON CONFLICT (name) DO NOTHING;
    SELECT id INTO canonical_id FROM tag WHERE name = canonical;

    INSERT INTO game_tag (game_id, tag_id)
        SELECT game_id, canonical_id FROM game_tag WHERE tag_id = variant_id
        ON CONFLICT (game_id, tag_id) DO NOTHING;

    -- game_tag rows go with the tag (ON DELETE CASCADE).
    DELETE FROM tag WHERE id = variant_id;

    INSERT INTO tag_alias (alias, tag_id) VALUES (variant, canonical_id)
        ON CONFLICT (alias) DO UPDATE SET tag_id = EXCLUDED.tag_id;
END;
$$ LANGUAGE plpgsql;

-- The variants agreed on #207. Roguelite and shoot 'em up stay separate from
-- roguelike and shooter (different genres); only their spellings merge.
SELECT merge_tag_variant(variant, canonical) FROM (VALUES
    ('coop', 'co-op'),
    ('platform', 'platformer'),
    ('platforms', 'platformer'),
    ('plaftorm', 'platformer'),
    ('simulator', 'simulation'),
    ('aventure', 'adventure'),
    ('rogue-like', 'roguelike'),
    ('shoot''em''up', 'shoot ''em up'),
    ('beat''em up', 'beat ''em up'),
    ('rythm', 'rhythm'),
    ('first person', 'first-person'),
    ('sport', 'sports')
) AS pairs (variant, canonical);

-- Tags with no name (e.g. from a trailing comma) go, with their links.
DELETE FROM tag WHERE btrim(name) = '';
