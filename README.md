[![Client CI](https://github.com/indie-collective/community/workflows/Client%20CI/badge.svg)](https://github.com/indie-collective/community/actions?query=workflow%3A%22Client+CI%22)

## Requirements

- PostgreSQL
- Node.js
- Yarn / NPM

## Installation

```bash
# Create a new database
psql -c "create database indieco"

# Import schema
psql --dbname=indieco -f server/schema.sql

# Import data
psql --dbname=indieco -f server/data.sql

cd server && yarn
cd ../client && yarn
```