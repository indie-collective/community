/**
 * The text a game, organisation or event is searched by (ADR 0003): its
 * fields joined, lowercased, with accents removed and spaces collapsed, so
 * a LIKE match ignores case and accents ("jeu" finds "Jéu").
 */
export function searchText(...fields) {
  return normalizeSearch(fields.filter(Boolean).join(' '));
}

/** The same normalisation, for what people type into search. */
export function normalizeSearch(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
