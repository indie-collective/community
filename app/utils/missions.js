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
 * fills it in place (text, url, tags, igdb, bluesky); without one, the
 * mission links to the record's page to add it there. `fields` are the
 * change log fields that fill it.
 */
export const GAPS = {
  game: [
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'studio', label: 'Studio', weight: 3, fields: ['organizations'] },
    { key: 'images', label: 'Images', weight: 2, fields: ['images'] },
    { key: 'tags', label: 'Tags', weight: 2, input: 'tags', fields: ['tag_ids'] },
    { key: 'site', label: 'Website', weight: 2, input: 'url', fields: ['site'] },
    { key: 'igdb', label: 'IGDB link', weight: 1, input: 'igdb', fields: ['igdb_slug'] },
    { key: 'timeline', label: 'Timeline', weight: 1, fields: ['milestones'] },
  ],
  organization: [
    { key: 'place', label: 'Location', weight: 3, fields: ['country_code'] },
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'logo', label: 'Logo', weight: 2, fields: ['logo_key'] },
    { key: 'site', label: 'Website', weight: 2, input: 'url', fields: ['site'] },
    { key: 'bluesky', label: 'Bluesky', weight: 1, input: 'bluesky', fields: ['bsky_handle'] },
  ],
  event: [
    { key: 'about', label: 'Description', weight: 3, input: 'text', fields: ['about'] },
    { key: 'hosts', label: 'Organisers', weight: 2, fields: ['organization_ids'] },
    { key: 'cover', label: 'Cover', weight: 2, fields: ['cover_key'] },
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

/** Every achievement: `[key, name, what it takes, unlocked(tally)]`. */
export const ACHIEVEMENTS = [
  ['first-find', 'First find', 'Fill in something missing', (t) => t.filled >= 1],
  ['first-mission', 'First mission', 'Complete a record on a mission', (t) => t.missions >= 1],
  ['missions-50', 'Mission regular', 'Complete 50 records on missions', (t) => t.missions >= 50],
  ['records-10', 'Fact finder', 'Complete 10 records', (t) => t.records >= 10],
  ['records-100', 'Researcher', 'Complete 100 records', (t) => t.records >= 100],
  ['records-1000', 'Encyclopedist', 'Complete 1,000 records', (t) => t.records >= 1000],
  ['archivist', 'Archivist', 'Write 10 missing descriptions', (t) => sum(t.byGap, 'game:about', 'organization:about', 'event:about') >= 10],
  ['cartographer', 'Cartographer', 'Place 10 organisations on the map', (t) => sum(t.byGap, 'organization:place') >= 10],
  ['photographer', 'Photographer', 'Add 10 missing images, logos or covers', (t) => sum(t.byGap, 'game:images', 'organization:logo', 'event:cover') >= 10],
  ['talent-scout', 'Talent scout', 'Credit 5 publishers', (t) => t.publishers >= 5],
  ['historian', 'Historian', 'Add 10 steps to games’ timelines', (t) => t.milestones >= 10],
  ['event-planner', 'Event planner', 'Fill in 10 things missing from events', (t) => Object.entries(t.byGap).filter(([key]) => key.startsWith('event:')).reduce((n, [, v]) => n + v, 0) >= 10],
  ['founder', 'Founder', 'Add 10 games, organisations or events', (t) => t.added >= 10],
];

/** The achievements a tally unlocks: `{ key, name, description }`. */
export const achievementsOf = (totals) =>
  ACHIEVEMENTS.filter(([, , , unlocked]) => unlocked(totals)).map(([key, name, description]) => ({ key, name, description }));
