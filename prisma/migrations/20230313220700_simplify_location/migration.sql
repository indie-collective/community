-- City cannot be filled if region is not filled
ALTER TABLE "location" ADD CONSTRAINT "city_needs_region" CHECK (city is NULL OR (city is not NULL and region is not NULL));

ALTER TABLE "location" ALTER COLUMN "city" DROP NOT NULL;

ALTER TABLE "location" ALTER COLUMN "region" DROP NOT NULL;