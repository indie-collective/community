import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import * as schema from '../db/schema.js';
import { RECORDED_LINKS, UNRECORDED_LINKS, changedFields, recordedColumns } from './changeLog';

const tables = Object.values(schema)
  .filter((value) => value && typeof value === 'object' && Symbol.for('drizzle:IsDrizzleTable') in value)
  .map((table) => getTableConfig(table));

describe('the change log', () => {
  it('records every column of games, organisations and events but bookkeeping', () => {
    for (const table of [schema.games, schema.organizations, schema.events]) {
      const names = recordedColumns(table).map(([, column]) => column.name);
      expect(names).toContain('name');
      expect(names).toContain('deleted_at');
      expect(names).not.toContain('search_text');
      expect(names).not.toContain('updated_at');
    }
    expect(recordedColumns(schema.events).map(([, c]) => c.name)).toEqual(
      expect.arrayContaining(['ticket_url', 'previous_edition_id', 'attendance', 'online_url'])
    );
  });

  // A new table linked to a game, organisation or event must be recorded
  // with it, or listed as not: else a vandal's changes there leave no trace.
  it('knows every table linked to games, organisations and events', () => {
    const recorded = new Set(Object.values(RECORDED_LINKS).flat());
    const linked = tables
      .filter((table) =>
        table.foreignKeys.some((fk) =>
          ['games', 'organizations', 'events'].includes(getTableConfig(fk.reference().foreignTable).name)
        )
      )
      .map((table) => table.name)
      .filter((name) => !['games', 'organizations', 'events'].includes(name));
    for (const name of linked) {
      expect(recorded.has(name) || UNRECORDED_LINKS.includes(name), name).toBe(true);
    }
  });
});

describe('changedFields', () => {
  it('keeps only what differs, before and after', () => {
    expect(
      changedFields({ name: 'A', about: 'x', tag_ids: ['t1'] }, { name: 'B', about: 'x', tag_ids: ['t1', 't2'] })
    ).toEqual({
      before: { name: 'A', tag_ids: ['t1'] },
      after: { name: 'B', tag_ids: ['t1', 't2'] },
    });
  });

  it('finds nothing in an unchanged save, where empty text is nothing', () => {
    expect(changedFields({ name: 'A', site: null, about: null }, { name: 'A', about: '' })).toEqual({ before: {}, after: {} });
  });
});
