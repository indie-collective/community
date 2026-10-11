# 0004: Full-text search with D1's FTS5

**Status:** accepted (2026-10-11, #306). Supersedes the search part of ADR 0003.

## Context

ADR 0003 replaced Postgres full-text search with a `search_text` column matched by `LIKE`: unranked, unlimited, and only names and descriptions. Search needed ranking, and to find records by place, tags and related records.

Options weighed:
- **Cloudflare AI Search**: hybrid keyword and semantic search, but built for documents and pages, indexed asynchronously, and billed per query beyond 1,000 a month: a poor fit for short records searched as people type.
- **Ranking on top of `LIKE`**: no new parts, but crude relevance.
- **D1's FTS5**: BM25 ranking, prefix matching and accent folding, inside the database we have, free.

## Decision

- One FTS5 table, `search_index`, holds games, studios, associations and events (not people). Its rows come from a view, `search_documents`: name, related names (a game's studios, an organisation's games, an event's games and organisers), place (city, region, and the country's English and French names), a game's tags, and the description. Deleted records are left out.
- **Triggers** (an exception to ADR 0003's "no database logic": the index is derived data, not behaviour) rebuild a record's row whenever it, or what it's searched by, changes, so every write path (routes, scripts, the copy) keeps the index current without knowing it exists.
- Ranking: names equal to the query, then names starting with it, then BM25 with names weighted 10, places and tags 4, related names 3 and descriptions 1. Past events come after upcoming ones. Each result says why it matched when it isn't its name (an FTS5 snippet).
- `search_text` stays, for the lists' filters.

## Consequences

- `wrangler d1 export` refuses a database with a virtual table. `scripts/backup-d1.mjs` reads the tables with queries instead, and writes the index's rebuild and the triggers after the data. A new virtual table must be added to its `REBUILT_FROM`.
- Drizzle doesn't model the view, table or triggers: they live in migration 0004, and queries use SQL (`app/data/search.server.js`).
- No typo tolerance: "celest" finds "Celeste", "celste" doesn't.
