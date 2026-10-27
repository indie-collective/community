/**
 * A game's timeline (#332): the steps of its life (milestones), the events
 * it went to and its release date from IGDB, in order, with how long each
 * came after the first. Shared by the page and its tests.
 */

/** How each milestone kind (`game_milestones.kind`) is labelled. */
export const MILESTONE_KINDS = [
  ['announced', 'Announced'],
  ['prototype', 'Prototype'],
  ['alpha', 'Alpha'],
  ['beta', 'Beta'],
  ['demo', 'Demo'],
  ['early_access', 'Early access'],
  ['funded', 'Funded'],
  ['signed', 'Signed with a publisher'],
  ['released', 'Released'],
  ['ported', 'Ported'],
  ['update', 'Update'],
  ['other', 'Other'],
];

/** The kind's label. */
export const milestoneLabel = (kind) =>
  MILESTONE_KINDS.find(([value]) => value === kind)?.[1] ?? kind;

export const MAX_NOTE_LENGTH = 140;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * A milestone's date from a form's year, and optional month (1–12) and day:
 * `{ date, precision }`, `date` the start of that period in UTC, or null
 * when they don't make a real date.
 */
export function milestoneDate(year, month, day) {
  const y = Number(year);
  const m = month === '' || month == null ? null : Number(month);
  const d = day === '' || day == null ? null : Number(day);
  if (!Number.isInteger(y) || y < 1970 || y > 2100) return null;
  if (m == null) return d == null ? { date: new Date(Date.UTC(y, 0, 1)), precision: 'year' } : null;
  if (!Number.isInteger(m) || m < 1 || m > 12) return null;
  if (d == null) return { date: new Date(Date.UTC(y, m - 1, 1)), precision: 'month' };
  const date = new Date(Date.UTC(y, m - 1, d));
  if (!Number.isInteger(d) || date.getUTCMonth() !== m - 1) return null;
  return { date, precision: 'day' };
}

/** A date as precisely as it's known: "2021", "March 2021", "14 March 2021". */
export function formatMilestoneDate(date, precision) {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  if (precision === 'year') return String(year);
  const month = MONTHS[value.getUTCMonth()];
  if (precision === 'month') return `${month} ${year}`;
  return `${value.getUTCDate()} ${month} ${year}`;
}

// Whole months from one date to another (UTC), never negative.
const monthsBetween = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
  return Math.max(0, b.getUTCDate() < a.getUTCDate() ? months - 1 : months);
};

/** A number of months as "1 year 3 months", "8 months", or "" for none. */
export function formatDuration(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [
    years > 0 && `${years} ${years === 1 ? 'year' : 'years'}`,
    rest > 0 && `${rest} ${rest === 1 ? 'month' : 'months'}`,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The timeline's entries, oldest first: `{ type: 'milestone' | 'event' |
 * 'release', date, precision, since, … }`, `since` the months since the
 * first entry. IGDB's release date (Unix seconds) is only used when no
 * milestone says when the game was released. On the same date, milestones
 * come before events.
 *
 * @param {{ milestones?: object[], events?: object[], igdbReleaseDate?: number }} game
 *   milestones as `{ id, kind, date, date_precision, note }`, events as
 *   the page has them (`starts_at`, `ends_at`, `time_zone`, `name`…)
 */
export function buildTimeline({ milestones = [], events = [], igdbReleaseDate } = {}) {
  const order = { milestone: 0, release: 1, event: 2 };
  const entries = [
    ...milestones.map((milestone) => ({
      type: 'milestone',
      id: milestone.id,
      kind: milestone.kind,
      note: milestone.note,
      date: new Date(milestone.date),
      precision: milestone.date_precision,
    })),
    ...events.map((event) => ({
      type: 'event',
      id: event.id,
      event,
      date: new Date(event.starts_at),
      precision: 'day',
    })),
  ];
  if (igdbReleaseDate && !milestones.some(({ kind }) => kind === 'released')) {
    entries.push({ type: 'release', id: 'igdb-release', date: new Date(igdbReleaseDate * 1000), precision: 'day' });
  }
  entries.sort((a, b) => a.date - b.date || order[a.type] - order[b.type]);
  const start = entries[0]?.date;
  return entries.map((entry) => ({ ...entry, since: monthsBetween(start, entry.date) }));
}

/**
 * How long the game took from its first step to its release, as "2 years
 * 4 months", or null without both (or when it was released first).
 */
export function timeToRelease(entries) {
  const release = entries.find(
    (entry) => entry.type === 'release' || (entry.type === 'milestone' && entry.kind === 'released')
  );
  if (!release || release === entries[0]) return null;
  return formatDuration(release.since) || null;
}

/** A timeline as lines of text, for the history's before and after. */
export const milestonesText = (milestones = []) =>
  [...milestones]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(
      (m) =>
        `${formatMilestoneDate(m.date, m.date_precision)}: ${milestoneLabel(m.kind)}${m.note ? ` (${m.note})` : ''}\n`
    )
    .join('');
