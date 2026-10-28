// What the change log records (#309, #340), apart from the database so it
// can be tested: see data/changes.server.
import { getTableColumns } from 'drizzle-orm';

// Columns a change doesn't record: derived from others, or bookkeeping.
export const UNRECORDED_COLUMNS = ['searchText', 'createdAt', 'updatedAt', 'lastModifiedById'];

/** A table's recorded columns: `[key, column]` pairs, from its schema. */
export const recordedColumns = (table) =>
  Object.entries(getTableColumns(table)).filter(([key]) => !UNRECORDED_COLUMNS.includes(key));

// The tables linked to games, organisations and events that their changes
// record, and those they don't (attendance isn't content; IGDB data is
// fetched, not entered).
export const RECORDED_LINKS = {
  game: ['game_tags', 'game_organizations', 'game_events', 'game_images', 'game_milestones'],
  organization: ['organization_events'],
  event: ['game_events', 'organization_events'],
};
// Opportunities are records of their own, with their own changes (#345).
export const UNRECORDED_LINKS = ['event_participants', 'game_igdb', 'opportunities'];

// Empty text and nothing are the same: forms send one for the other.
const comparable = (value) => JSON.stringify(value === '' || value === undefined ? null : value);

/** The fields that differ between two snapshots, as `{ before, after }`. */
export function changedFields(before = {}, after = {}) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter(
    (key) => comparable(before?.[key]) !== comparable(after?.[key])
  );
  return {
    before: Object.fromEntries(keys.map((key) => [key, before?.[key] ?? null])),
    after: Object.fromEntries(keys.map((key) => [key, after?.[key] ?? null])),
  };
}
