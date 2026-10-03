import tsquery from 'pg-tsquery';

const ts = new tsquery.Tsquery();

function activatePartialNest(node) {
  if (node.left) {
    activatePartialNest(node.left);
  }
  if (node.right) {
    activatePartialNest(node.right);
  }

  node.prefix = ':*';
}

/**
 * Builds a Postgres full-text query that prefix-matches every word.
 *
 * Returns null when the text has nothing searchable (missing, blank or only
 * operators), so callers can skip the query instead of crashing (#176).
 */
export function getFullTextSearchQuery(str) {
  if (typeof str !== 'string' || !str.trim()) return null;

  const node = ts.parse(str);
  if (!node) return null;

  activatePartialNest(node);

  return node.toString();
}
