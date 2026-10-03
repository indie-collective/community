/**
 * Tag names as stored: trimmed, lower case, single spaces, straight
 * apostrophes, and "'em" spelled one way ("shoot'em'up" → "shoot 'em up").
 */
export function normalizeTagName(name) {
  return String(name)
    .normalize('NFC')
    .replace(/[‘’`´]/g, "'")
    .toLowerCase()
    .replace(/\s*'\s*em\b\s*'?\s*/g, " 'em ")
    .replace(/\s+/g, ' ')
    .trim();
}

/** A comma-separated tags field as normalised, unique, non-empty names. */
export function parseTagList(value) {
  if (!value) return [];
  return [...new Set(String(value).split(',').map(normalizeTagName).filter(Boolean))];
}
