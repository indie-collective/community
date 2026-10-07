-- #254: store each game's IGDB data instead of calling IGDB on every view.
-- A table of its own, not columns on "game": updating "game" bumps its
-- updated_at and records a change (the game_change trigger).
CREATE TABLE "game_igdb" (
    "game_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "data" JSONB,
    "fetched_at" TIMESTAMPTZ(6),
    "refresh_started_at" TIMESTAMPTZ(6),

    CONSTRAINT "game_igdb_pkey" PRIMARY KEY ("game_id")
);

CREATE INDEX "game_igdb_fetched_at_idx" ON "game_igdb"("fetched_at");

ALTER TABLE "game_igdb" ADD CONSTRAINT "game_igdb_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Values kept between requests, like the IGDB access token (memory doesn't
-- last between requests on Workers).
CREATE TABLE "kv_store" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "kv_store_pkey" PRIMARY KEY ("key")
);
