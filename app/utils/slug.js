/**
 * Readable URLs (#209): games, organisations and events are addressed by a
 * slug made from their name ("/game/celeste"), unique per kind. Old UUID
 * URLs, and slugs from before a rename, redirect to the current one.
 */
const MAX_LENGTH = 80;

/** A name as a slug: lowercase, no accents, words joined by hyphens. */
export function slugify(text) {
  const slug = String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= MAX_LENGTH) return slug || 'untitled';
  // Cut at a word boundary.
  const cut = slug.slice(0, MAX_LENGTH);
  return cut.slice(0, cut.lastIndexOf('-') > 40 ? cut.lastIndexOf('-') : MAX_LENGTH).replace(/-+$/, '');
}

/**
 * An event's slug: its name, with its year when the name lacks it, so
 * editions read apart ("global-game-jam-2025").
 */
export function eventSlug(name, startsAt) {
  const slug = slugify(name);
  const year = startsAt ? String(new Date(startsAt).getUTCFullYear()) : null;
  return year && !slug.split('-').includes(year) ? `${slug}-${year}` : slug;
}

/** The first of `base`, `base-2`, `base-3`… not in `taken`. */
export function firstFreeSlug(base, taken) {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether a URL segment is a UUID (an old URL) rather than a slug. */
export const isUuid = (value) => UUID.test(value ?? '');

// A record's page: by slug, or by ID until it has one.
const path = (kind) => (record) => `/${kind}/${record?.slug || record?.id}`;
export const gamePath = path('game');
export const orgPath = path('org');
export const eventPath = path('event');

/**
 * Slugs for records that have none yet (seeding, the copy from Postgres,
 * backfills): `{ id, name, startsAt?, createdAt? }[]` → Map(id → slug),
 * unique among themselves and `taken`. The oldest record gets the plain
 * slug, later ones `-2`, `-3`… Events (`event: true`) add their year.
 */
export function assignSlugs(records, { event = false, taken = new Set() } = {}) {
  const used = new Set(taken);
  const slugs = new Map();
  const oldestFirst = [...records].sort(
    (a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
  );
  for (const record of oldestFirst) {
    const base = event ? eventSlug(record.name, record.startsAt) : slugify(record.name);
    const slug = firstFreeSlug(base, used);
    used.add(slug);
    slugs.set(record.id, slug);
  }
  return slugs;
}
