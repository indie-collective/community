# The D1 schema: #150's end state, written for SQLite and Drizzle

The schema cleanup (#150) was planned as a series of Prisma migrations on Postgres. But nothing runs main's database in production: the live site is v2 on Supabase, and ADR 0002 runs no migration there before the cutover. So the remaining stages aren't migrated on Postgres. They're designed straight into the new D1 schema, written with **Drizzle**, and the one-off copy script turns the old Postgres shape into the new one. Decided by engleek on 2026-10-09, with storing locations on orgs and events and images as columns.

## Decisions

- **Drizzle**, not Prisma. Main switches to D1 and Drizzle wholesale; development and tests use a local D1. There's no running Postgres deployment to stay compatible with.
- **No database logic.** No triggers, functions or extensions. The change log and soft delete live in the app, written in the same D1 batch as the change they record.
- **Locations stored on orgs and events.** `country_code`, `region`, `city`, `street`, `latitude`, `longitude` are columns of `organizations` and `events`. The shared `location` table goes: two orgs at one address simply repeat it.
- **Images as columns.** An org's logo, an event's cover and a person's avatar are `*_key`, `*_width` and `*_height` columns. A game's images, which can be many, are rows of `game_images` holding the same three fields and a position. The `image` table goes. The thumbnail is `thumb_<key>`, pre-generated (ADR 0002). Images without a file (2 of 2,635 in production) aren't copied.
- **IDs stay UUIDs** (text), so every existing URL keeps working.
- **Times are Unix milliseconds** (integers): they sort and compare as numbers in SQLite. Event times keep their own `time_zone` (#204).
- **Enums are text with a CHECK constraint**, mirrored as TypeScript unions in Drizzle.
- **Search is a normalised `search_text` column** (lowercase, accents removed), written by the app and matched with `LIKE`, instead of Postgres full-text search. With ~2,000 rows per table a scan is cheap, and it needs no FTS5 triggers. "jeu" finds "Jéu".
- **Join tables stay explicit.** Drizzle has no implicit many-to-many, and two of them carry data (`role`, `position`).

## Tables

Names are plural and snake_case in SQLite, camelCase in code. **New names** are flagged ✱.

| Table | Columns (besides `id`, `created_at`, `updated_at`) | From |
|---|---|---|
| `organizations` ✱ | `type` (studio, association), `status` (active, closed, hiatus), `name`, `about`, `site`, `bsky_handle`, location columns, logo columns, `search_text`, `deleted_at` ✱, `last_modified_by_id` | `entity` + its `location` and `logo` |
| `games` | `name`, `about`, `site`, `igdb_slug` (unique), `search_text`, `deleted_at` (was `deleted`), `last_modified_by_id` | `game` |
| `events` | `name`, `about`, `site`, `starts_at`, `ends_at`, `time_zone`, `status` (ongoing, canceled), location columns, cover columns, `search_text`, `deleted_at` ✱, `last_modified_by_id` | `event` + its `location` and `cover` |
| `people` | `username` (unique, ≤ 30), `first_name`, `last_name`, `about`, `email` (unique), avatar columns, `avatar_url` (from sign-in), `role` ✱, `did` ✱ (unique), `discord_id` (until the cutover) | `person` |
| `game_organizations` | `game_id`, `organization_id`, `role` (developer, co_developer, publisher, porting, support) | `game_entity` |
| `game_events` | `game_id`, `event_id` | `game_event` |
| `organization_events` | `organization_id`, `event_id` | `entity_event` |
| `event_participants` | `event_id`, `person_id`, `joined_at` | `event_participant` |
| `game_images` | `game_id`, `key`, `width`, `height`, `position` ✱ | `game_image` + `image` |
| `tags`, `tag_aliases`, `game_tags` | as now | as now |
| `changes` | `operation`, `table_name`, `record_id`, `data` (JSON text), `author_id` | `change` |
| `game_igdb`, `kv` | as now | `game_igdb`, `kv_store` |

Indexes: every foreign key, `country_code` on organizations and events, `starts_at` and `ends_at` on events, `deleted_at` on the three soft-deleted tables, `(table_name, record_id)` on changes.

## Three calls, confirmed by engleek on 2026-10-09

1. **`entity` becomes `organizations`.** The code and the UI already say "org" and "organisation"; only the table said "entity". With a new database the rename is free, and every query is rewritten for Drizzle anyway.
2. **Orgs and events are soft-deleted too.** Today only games are; deleting an org or event removes it, and its history page loses its subject. With `deleted_at` on all three, deletion works the same everywhere and can be undone by an admin.
3. **`people.role` replaces `isAdmin`**, per #153 (roles in the database): `admin`, `member` (can edit) or `restricted` (can't edit), default `member`, matching today's "any member can edit". YoruNoHikage and engleek start as `admin`. #153's two open questions only change the default and add values.

## Bluesky (#162)

`people.did` links an account to its Bluesky identity; the six existing people get theirs at the cutover. The OAuth client's state and sessions go in `kv`, under prefixed keys. Discord sign-in, and `discord_id`, go at the cutover.

## In the app (2026-10-10)

How the data layer (`app/data`) uses the schema, decided while porting it:

- **The change log** is written by `logChange` in the same `db.batch` as the change: an `INSERT … SELECT json_object(…)` that records the row as it then is, with the old field names, so revision pages diff old and new rows alike. Creations and deletions now record their author.
- **Deletion** sets `deleted_at` on games, organisations and events; every read leaves deleted rows out, and their history stays.
- **Uploads** are kept in `kv` for a day under a new ID (`upload:<id>`, holding the key and size). Forms send that ID as before; attaching it copies the key and size into the record's image columns.
- **Search** matches every word of the query at the start of a word of `search_text` (name and description), as Postgres prefix matching did; the games list's filter matches anywhere in it.
- **Shapes:** the data modules return what the routes read from Prisma (`location`, `logo`, `game_entity`, snake_case fields), built by `app/data/shapes.server.js`, so routes and models didn't change.
- **Until the Workers switch,** the app runs on Node and reaches a local D1 through wrangler's platform proxy (`app/db/index.server.js`); development and the end-to-end tests run on local D1.
