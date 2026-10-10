// Search on the `search_text` column (ADR 0003), which replaces Postgres
// full-text search: lowercase, accents removed, matched with LIKE.
import { and, sql } from 'drizzle-orm';

import { normalizeSearch } from './searchText.js';

/** The words of a search, normalised; empty when there's nothing to find. */
export function searchWords(q) {
  if (typeof q !== 'string') return [];
  return normalizeSearch(q)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

// LIKE's wildcards, escaped with a backslash.
const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => '\\' + c);

// Punctuation inside stored text that also separates words: "o'conner",
// "co-op", "studio.io". The column is read with each as a space.
const SEPARATORS = ["'", '-', '.', ',', ':', ';', '!', '?', '(', ')', '/', '&', '+', '"', '_', '#', '@'];
// As SQL literals, not parameters: D1 allows 100 parameters per query.
const spaced = (column) =>
  SEPARATORS.reduce(
    (text, separator) =>
      sql`replace(${text}, ${sql.raw(`'${separator.replace(/'/g, "''")}'`)}, ' ')`,
    column
  );

/**
 * A condition: every word of `q` starts a word of the column (as Postgres
 * prefix matching did: "cel" finds "Celeste"), or with `anywhere`, appears
 * in it. Null when `q` has no words, so callers can skip the query (#176).
 */
export function matchesSearch(column, q, { anywhere = false } = {}) {
  const words = searchWords(q);
  if (words.length === 0) return null;
  return and(
    ...words.map((word) =>
      anywhere
        ? sql`${column} like ${'%' + escapeLike(word) + '%'} escape '\\'`
        : sql`(' ' || ${spaced(column)}) like ${'% ' + escapeLike(word) + '%'} escape '\\'`
    )
  );
}
