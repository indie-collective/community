[![Client CI](https://github.com/indie-collective/community/workflows/Client%20CI/badge.svg)](https://github.com/indie-collective/community/actions?query=workflow%3A%22Client+CI%22)

## Requirements

- PostgreSQL
- Node.js
- NPM

## Installation

```bash
# Create a new database
psql -c "create database indieco"

# Import schema
psql --dbname=indieco -f server/schema.sql

# Import data
psql --dbname=indieco -f server/data.sql

npm run dev
```

## Session secret

Session cookies are signed with `SESSION_SECRET`. It is required in production, and the server will not start without it. Generate one with `openssl rand -hex 32`.

To rotate it, set `SESSION_SECRET=new,old`: new cookies are signed with the first secret, and cookies signed with the others are still accepted until they expire.

## Migrating to Prisma

If you own a dataset that was used before migrating to Prisma, just set up your database and use this command to mark the first migration in your database:

```sh
# Either prod or development, this marks the first migration as resolved
npx prisma migrate resolve --applied "20220905205917_init"

# Then run all the others migrations
npx prisma migrate deploy

# Verify all migrations have run well and sync with latest schema
npx prisma migrate dev
```

## D1 (Cloudflare), in progress

The app is moving to Cloudflare D1 with Drizzle (ADR 0002, ADR 0003, #151). The schema is `app/db/schema.js`; it doesn't serve the app yet.

```sh
# Generate a migration after changing app/db/schema.js
npm run db:generate -- --name <what-changed>

# Create or update the local D1 (in .wrangler/)
npm run db:migrate

# Copy a Postgres in main's shape into the empty local D1, checking row counts
DATABASE_URL=postgres://… npm run db:copy -- --apply local
```
