ALTER TABLE "game" ADD COLUMN "igdb_data" JSONB;
ALTER TABLE "game" ADD COLUMN "igdb_data_fetched_at" TIMESTAMPTZ;
