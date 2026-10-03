import { parseTagList } from './tags';

/**
 * The canonical tag names for a comma-separated tags field (#207): parsed and
 * normalised, then mapped through tag aliases ("coop" → "co-op"), unique.
 */
export async function resolveTagNames(db, value) {
  const names = parseTagList(value);
  if (names.length === 0) return [];

  const aliases = await db.tag_alias.findMany({
    where: { alias: { in: names } },
    select: { alias: true, tag: { select: { name: true } } },
  });
  const canonical = new Map(aliases.map(({ alias, tag }) => [alias, tag.name]));

  return [...new Set(names.map((name) => canonical.get(name) ?? name))];
}
