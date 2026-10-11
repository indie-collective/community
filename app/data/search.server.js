// Full-text search (#306): games, studios, associations and events, in the
// search_index FTS5 table (migration 0004), which triggers keep current.
// People aren't searched.
import { sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { matchQuery } from '../db/search.js';
import { normalizeSearch } from '../db/searchText.js';

export const SEARCH_KINDS = ['game', 'studio', 'association', 'event'];

// Where a match starts and ends in `match.text`: control characters, which
// stored text doesn't hold, so the UI can split on them safely.
export const MATCH_START = '\u0002';
export const MATCH_END = '\u0003';

// LIKE's wildcards, escaped with a backslash.
const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => '\\' + c);

// Why a record matched, when it isn't its name: the first column, in this
// order, that holds a matched word, as a snippet with the words marked.
const MATCH_FIELDS = ['related', 'about', 'tags', 'place'];
function matchOf(row) {
  if (row.name_matched) return null;
  const field = MATCH_FIELDS.find((name) => row[name]?.includes(MATCH_START));
  return field ? { field, text: row[field] } : null;
}

/**
 * Records matching `q`, best first: names that are the query, then names
 * that start with it, then by BM25, with names weighted highest, then tags
 * and places, related names, and descriptions last. Past events come after
 * upcoming ones.
 *
 * With `perKind`, `limit` and `offset` apply to each kind, and `counts`
 * holds how many each kind has; otherwise to all of them together, and
 * `counts.all` is the total.
 *
 * @returns {Promise<{ hits: { kind, id, match }[], counts: object } | null>}
 *   `match` is `{ field, text }` when the name didn't match (see
 *   MATCH_START); null for an empty query
 */
export async function searchIndex(
  q,
  {
    kinds = SEARCH_KINDS,
    limit = 10,
    offset = 0,
    excludeIds = [],
    perKind = false,
  } = {}
) {
  const match = matchQuery(q);
  if (!match) return null;
  const phrase = escapeLike(normalizeSearch(q));
  const snippet = (column) =>
    sql.raw(`snippet(search_index, ${column}, char(2), char(3), '…', 10)`);

  const rows = await db.all(sql`
    SELECT kind, id, name_matched, related, place, tags, about, position, total
    FROM (
      SELECT *,
        row_number() OVER (${perKind ? sql`PARTITION BY kind` : sql``}
          ORDER BY past, name_rank, score, id) AS position,
        count(*) OVER (${perKind ? sql`PARTITION BY kind` : sql``}) AS total
      FROM (
        SELECT
          search_index.kind AS kind,
          search_index.record_id AS id,
          CASE WHEN search_index.kind = 'event' AND events.ends_at < ${Date.now()}
            THEN 1 ELSE 0 END AS past,
          CASE
            WHEN lower(search_index.name) = ${normalizeSearch(q)} THEN 0
            WHEN lower(search_index.name) LIKE ${phrase + '%'} ESCAPE '\\' THEN 1
            ELSE 2
          END AS name_rank,
          bm25(search_index, 0, 0, 10, 3, 4, 4, 1) AS score,
          instr(highlight(search_index, 2, char(2), char(3)), char(2)) > 0 AS name_matched,
          ${snippet(3)} AS related,
          ${snippet(4)} AS place,
          ${snippet(5)} AS tags,
          ${snippet(6)} AS about
        FROM search_index
        LEFT JOIN events ON events.id = search_index.record_id
        WHERE search_index MATCH ${match}
          AND search_index.kind IN (${sql.join(
            kinds.map((kind) => sql`${kind}`),
            sql`, `
          )})
          ${
            excludeIds.length
              ? sql`AND search_index.record_id NOT IN (${sql.join(
                  excludeIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              : sql``
          }
      )
    )
    WHERE position > ${offset} AND position <= ${offset + limit}
    ORDER BY kind, position
  `);

  // Counts come with the rows; a kind past its last page has none, so
  // count those apart.
  const counts = perKind
    ? Object.fromEntries(kinds.map((kind) => [kind, 0]))
    : { all: 0 };
  for (const row of rows) counts[perKind ? row.kind : 'all'] = row.total;
  if (offset > 0)
    Object.assign(counts, await countMatches(match, kinds, perKind));

  return {
    hits: rows
      .sort((a, b) => a.position - b.position)
      .map((row) => ({ kind: row.kind, id: row.id, match: matchOf(row) })),
    counts,
  };
}

/**
 * How many records of each kind match `q`: `{ game, studio, association,
 * event }`. Null for an empty query.
 */
export async function countSearch(q) {
  const match = matchQuery(q);
  if (!match) return null;
  return {
    ...Object.fromEntries(SEARCH_KINDS.map((kind) => [kind, 0])),
    ...(await countMatches(match, SEARCH_KINDS, true)),
  };
}

async function countMatches(match, kinds, perKind) {
  const rows = await db.all(sql`
    SELECT kind, count(*) AS total FROM search_index
    WHERE search_index MATCH ${match}
      AND kind IN (${sql.join(
        kinds.map((kind) => sql`${kind}`),
        sql`, `
      )})
    GROUP BY kind
  `);
  if (!perKind) return { all: rows.reduce((sum, row) => sum + row.total, 0) };
  return Object.fromEntries(rows.map((row) => [row.kind, row.total]));
}
