// Fact-finding missions (#339): what's missing from a record (its gaps),
// what filling them is worth, and the achievements members earn. Shared by
// missions, /admin/missing and profiles. Points come from the change log,
// so they follow real edits, and an undone change takes its points back.

export const MISSION_SIZE = 10;
export const MISSION_KINDS = ['game', 'organization', 'event'];

/** Why a member flags a record on a mission. */
export const FLAG_REASONS = [
  ['duplicate', 'It’s a duplicate'],
  ['gone', 'It closed or was canceled'],
  ['not-indie', 'It isn’t indie'],
  ['wrong', 'Something on it is wrong'],
];

/**
 * Each kind's gaps: `{ key, label, weight, input }`. `input` is how a mission
 * fills it in place: text, url, tags, igdb, bluesky, an organisation picked
 * or added (organization), an uploaded image (image), a place (place) or a
 * timeline step (milestone) (#378). `fields` are the change log fields that
 * fill it.
 */
export const GAPS = {
  game: [
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'studio', label: 'Studio', weight: 3, input: 'organization', fields: ['organizations'] },
    { key: 'images', label: 'Images', weight: 2, input: 'image', fields: ['images'] },
    { key: 'tags', label: 'Tags', weight: 2, input: 'tags', fields: ['tag_ids'] },
    { key: 'site', label: 'Website', weight: 2, input: 'url', fields: ['site'] },
    { key: 'igdb', label: 'IGDB link', weight: 1, input: 'igdb', fields: ['igdb_slug'] },
    { key: 'timeline', label: 'Timeline', weight: 1, input: 'milestone', fields: ['milestones'] },
  ],
  organization: [
    { key: 'place', label: 'Location', weight: 3, input: 'place', fields: ['country_code'] },
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'logo', label: 'Logo', weight: 2, input: 'image', fields: ['logo_key'] },
    { key: 'site', label: 'Website', weight: 2, input: 'url', fields: ['site'] },
    { key: 'bluesky', label: 'Bluesky', weight: 1, input: 'bluesky', fields: ['bsky_handle'] },
  ],
  event: [
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'hosts', label: 'Organisers', weight: 2, input: 'organization', fields: ['organization_ids'] },
    { key: 'cover', label: 'Cover', weight: 2, input: 'image', fields: ['cover_key'] },
    { key: 'site', label: 'Website', weight: 2, input: 'url', fields: ['site'] },
    { key: 'tickets', label: 'Tickets', weight: 1, input: 'url', fields: ['ticket_url'] },
  ],
};

export const KIND_LABELS = { game: 'Games', organization: 'Studios and associations', event: 'Events' };

export const gapOf = (kind, key) => GAPS[kind]?.find((gap) => gap.key === key) ?? null;

const empty = (value) => value == null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * What a member's changes add up to: `changes` are their change log rows
 * (`{ id, operation, kind, record_id, data }`), those undone left out
 * (`undone`, IDs). Points for each gap filled (empty before, not after), by
 * its weight, and 5 for each record added; the counts achievements need.
 */
export function tally(changes, { undone = new Set(), missions = 0 } = {}) {
  const totals = { points: 0, filled: 0, records: new Set(), added: 0, byGap: {}, publishers: 0, milestones: 0, missions };
  for (const change of changes) {
    if (undone.has(change.id) || change.data?.undo_of) continue;
    if (change.operation === 'create') {
      totals.points += 5;
      totals.added += 1;
      continue;
    }
    if (change.operation !== 'update' || change.data?.v !== 2) continue;
    const { before = {}, after = {} } = change.data;
    let any = false;
    for (const gap of GAPS[change.kind] ?? []) {
      const field = gap.fields.find((name) => name in after);
      if (!field || !empty(before[field]) || empty(after[field])) continue;
      totals.points += gap.weight;
      totals.filled += 1;
      totals.byGap[`${change.kind}:${gap.key}`] = (totals.byGap[`${change.kind}:${gap.key}`] ?? 0) + 1;
      any = true;
    }
    // Publishers credited, and timeline steps added, whatever was there.
    const credited = (list) => (list ?? []).filter((link) => link.role === 'publisher').length;
    if ('organizations' in after) totals.publishers += Math.max(0, credited(after.organizations) - credited(before.organizations));
    if ('milestones' in after) totals.milestones += Math.max(0, (after.milestones ?? []).length - (before.milestones ?? []).length);
    if (any) totals.records.add(`${change.kind}:${change.record_id}`);
  }
  return { ...totals, records: totals.records.size };
}

const sum = (byGap, ...keys) => keys.reduce((total, key) => total + (byGap[key] ?? 0), 0);

const eventGaps = (byGap) =>
  Object.entries(byGap)
    .filter(([key]) => key.startsWith('event:'))
    .reduce((n, [, v]) => n + v, 0);

/**
 * Every achievement (#377): `{ key, name, description, tier, measure, target }`.
 * `measure(tally)` counts towards it, and it's earned at `target`. The tier
 * sets its medal: bronze for firsts, silver for tens, gold for hundreds,
 * platinum beyond. Their icons are in components/AchievementBadge.
 */
export const ACHIEVEMENTS = [
  { key: 'first-find', name: 'First find', description: 'Fill in something missing', tier: 'bronze', measure: (t) => t.filled, target: 1 },
  { key: 'first-mission', name: 'First mission', description: 'Complete a record on a mission', tier: 'bronze', measure: (t) => t.missions, target: 1 },
  { key: 'missions-50', name: 'Mission regular', description: 'Complete 50 records on missions', tier: 'silver', measure: (t) => t.missions, target: 50 },
  { key: 'records-10', name: 'Fact finder', description: 'Complete 10 records', tier: 'silver', measure: (t) => t.records, target: 10 },
  { key: 'records-100', name: 'Researcher', description: 'Complete 100 records', tier: 'gold', measure: (t) => t.records, target: 100 },
  { key: 'records-1000', name: 'Encyclopedist', description: 'Complete 1,000 records', tier: 'platinum', measure: (t) => t.records, target: 1000 },
  { key: 'archivist', name: 'Archivist', description: 'Write 10 missing descriptions', tier: 'silver', measure: (t) => sum(t.byGap, 'game:about', 'organization:about', 'event:about'), target: 10 },
  { key: 'cartographer', name: 'Cartographer', description: 'Place 10 organisations on the map', tier: 'silver', measure: (t) => sum(t.byGap, 'organization:place'), target: 10 },
  { key: 'photographer', name: 'Photographer', description: 'Add 10 missing images, logos or covers', tier: 'silver', measure: (t) => sum(t.byGap, 'game:images', 'organization:logo', 'event:cover'), target: 10 },
  { key: 'talent-scout', name: 'Talent scout', description: 'Credit 5 publishers', tier: 'silver', measure: (t) => t.publishers, target: 5 },
  { key: 'historian', name: 'Historian', description: 'Add 10 steps to games’ timelines', tier: 'silver', measure: (t) => t.milestones, target: 10 },
  { key: 'event-planner', name: 'Event planner', description: 'Fill in 10 things missing from events', tier: 'silver', measure: (t) => eventGaps(t.byGap), target: 10 },
  { key: 'founder', name: 'Founder', description: 'Add 10 games, organisations or events', tier: 'silver', measure: (t) => t.added, target: 10 },
];

const plain = ({ key, name, description, tier, target }) => ({ key, name, description, tier, target });

/**
 * Every achievement and how far a tally is towards it: `{ key, name,
 * description, tier, target, value, earned }`, `value` capped at `target`.
 */
export const achievementProgress = (totals) =>
  ACHIEVEMENTS.map((achievement) => {
    const value = Math.min(achievement.measure(totals) || 0, achievement.target);
    return { ...plain(achievement), value, earned: value >= achievement.target };
  });

/** The achievements a tally unlocks: `{ key, name, description, tier, target }`. */
export const achievementsOf = (totals) =>
  ACHIEVEMENTS.filter((achievement) => achievement.measure(totals) >= achievement.target).map(plain);
