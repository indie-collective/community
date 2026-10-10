[![Client CI](https://github.com/indie-collective/community/workflows/Client%20CI/badge.svg)](https://github.com/indie-collective/community/actions?query=workflow%3A%22Client+CI%22)

## Requirements

- Node.js 22
- NPM

The app is a Cloudflare Worker (ADR 0002): React Router, with D1 for data (ADR 0003, Drizzle; the schema is `app/db/schema.js`) and R2 for images. Locally it all runs in workerd, wrangler's runtime, with a local D1 and R2 in `.wrangler/`: no database server to install.

## Installation

```bash
npm install

# A fresh local D1: migrated, and seeded with made-up data
npm run db:reset

npm run dev
```

Variables and secrets go in `.env` (or `.dev.vars`); wrangler.jsonc lists them. In development, `/signin` takes any email without a password (`DEV_SIGNIN=true` does the same in a build: never set it in production); the seed creates `harness-admin@indieco.test` and `harness-member@indieco.test`. Without `CDN_HOST`, images are served from the local R2 at `/images`.

```bash
# The production build, in workerd
npm run preview
```

## Deploying

```bash
npx wrangler login
npm run deploy
```

The first time: create the database and bucket (`npx wrangler d1 create indieco-community`, then put its ID in wrangler.jsonc; `npx wrangler r2 bucket create indieco-community-images`), apply the migrations (`npx wrangler d1 migrations apply DB --remote`), set the secrets listed in wrangler.jsonc (`npx wrangler secret put SESSION_SECRET`, …) and the `BASE_URL` and `CDN_HOST` vars. A Cron Trigger refreshes stale IGDB data every hour.

## Signing in with Bluesky

People sign in with their Bluesky account (AT Protocol OAuth, #157). Locally the app is a loopback client, which needs no setup, but Bluesky only sends people back to `127.0.0.1`: open the dev server at `http://127.0.0.1:5000`, not `localhost`. In production the client ID is `<BASE_URL>/oauth/client-metadata.json`, which the app publishes.

## Session secret

Session cookies are signed with `SESSION_SECRET`. It is required in production: without it, every request fails. Generate one with `openssl rand -hex 32`.

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

Then copy the images and their thumbnails from the old bucket (served publicly at `https://cdn.indieco.xyz`) into R2. It takes about 20 minutes, and can be run again to resume or retry:

```sh
node scripts/copy-images-to-r2.mjs --to remote   # or local
```

Prisma is only kept for this: the app itself doesn't use it.
