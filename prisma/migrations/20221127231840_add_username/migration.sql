CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION slugify("value" TEXT)
RETURNS TEXT AS $$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

CREATE FUNCTION set_default_username() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.username IS NOT NULL AND (SELECT COUNT(username) FROM indieco.person WHERE username = NEW.username) = 0 THEN RETURN NEW; END IF;

  NEW.username := concat(substring(concat(slugify(NEW.first_name), slugify(NEW.last_name)) for 26), lpad(floor(random() * (10000))::text, 4, '0'));
  RETURN NEW;
END
$$;

-- Add username column to person table
ALTER TABLE "person" ADD COLUMN     "username" VARCHAR(30);

UPDATE "person" SET username = concat(slugify(first_name), slugify(last_name), lpad(floor(random() * (10000))::text, 4, '0'));

-- Set username not null
ALTER TABLE "person" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "person_username_key" ON "person"("username");

CREATE TRIGGER "generate_username" BEFORE INSERT ON indieco.person FOR EACH ROW
EXECUTE PROCEDURE set_default_username();
