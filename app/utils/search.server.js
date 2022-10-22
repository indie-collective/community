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

export function getFullTextSearchQuery(str) {

  const node = ts.parse(str);

  activatePartialNest(node);

  return node.toString();
}
