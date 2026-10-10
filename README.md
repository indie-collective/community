[![Client CI](https://github.com/indie-collective/community/workflows/Client%20CI/badge.svg)](https://github.com/indie-collective/community/actions?query=workflow%3A%22Client+CI%22)

## Requirements

- Node.js 22
- NPM

The database is Cloudflare D1 (ADR 0002, ADR 0003), with Drizzle; the schema is `app/db/schema.js`. Locally it's wrangler's local D1, in `.wrangler/`: no database server to install.

## Installation

```bash
npm install

# A fresh local D1: migrated, and seeded with made-up data
npm run db:reset

npm run dev
```

Environment variables go in `.env` (the dev and start scripts load it). In development, `/signin` takes any email without a password; the seed creates `harness-admin@indieco.test` and `harness-member@indieco.test`.

## Session secret

Session cookies are signed with `SESSION_SECRET`. It is required in production, and the server will not start without it. Generate one with `openssl rand -hex 32`.

To rotate it, set `SESSION_SECRET=new,old`: new cookies are signed with the first secret, and cookies signed with the others are still accepted until they expire.

## Database

```sh
# Generate a migration after changing app/db/schema.js
npm run db:generate -- --name <what-changed>

# Apply migrations to the local D1
npm run db:migrate

# Seed it, or start over with a fresh one
npm run db:seed
npm run db:reset
```

`D1_PERSIST_PATH` points the app and scripts at another local D1 (the end-to-end tests make their own in `.wrangler/e2e`).

### Copying the production data (the cutover)

The data comes from a Supabase export, restored into a local Postgres and brought to main's last Postgres shape with the Prisma migrations in `prisma/` (see `docs/adr/0002-cloudflare-single-cutover.md`). Run the Postgres backfills there if needed (`scripts/backfill-*.mjs`), then copy it into an empty D1, checking every table's row count:

```sh
npm run db:migrate
DATABASE_URL=postgres://… npm run db:copy -- --apply local   # or remote
```

Prisma is only kept for this: the app itself doesn't use it.
