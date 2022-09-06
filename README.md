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
