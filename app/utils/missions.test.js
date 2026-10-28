import { describe, expect, it } from 'vitest';

import { ACHIEVEMENTS, achievementProgress, achievementsOf, tally } from './missions';

const update = (id, kind, before, after, extra = {}) => ({ id, operation: 'update', kind, record_id: `${kind}-${id}`, data: { v: 2, before, after, ...extra } });

describe('tally', () => {
  it('scores each gap filled by its weight, once per field, and counts records', () => {
    const totals = tally([
      update('1', 'organization', { about: null, country_code: null }, { about: 'Hi', country_code: 'FR' }),
      update('2', 'game', { tag_ids: [] }, { tag_ids: ['t1'] }),
      // A change to something already there isn't a find.
      update('3', 'game', { about: 'Old' }, { about: 'New' }),
      { id: '4', operation: 'create', kind: 'event', record_id: 'e', data: { v: 2, after: {} } },
    ]);
    expect(totals).toMatchObject({ points: 3 + 3 + 2 + 5, filled: 3, records: 2, added: 1 });
    expect(totals.byGap).toEqual({ 'organization:about': 1, 'organization:place': 1, 'game:tags': 1 });
  });

  it('takes back what was undone, and gives nothing for undos', () => {
    const changes = [update('1', 'game', { about: null }, { about: 'Spam' }), update('2', 'game', { about: 'Spam' }, { about: null }, { undo_of: '1' })];
    expect(tally(changes, { undone: new Set(['1']) }).points).toBe(0);
  });

  it('counts publishers credited and timeline steps added', () => {
    const totals = tally([
      update('1', 'game', { organizations: [{ role: 'developer' }] }, { organizations: [{ role: 'developer' }, { role: 'publisher' }] }),
      update('2', 'game', { milestones: [] }, { milestones: [{}, {}] }),
    ]);
    expect(totals).toMatchObject({ publishers: 1, milestones: 2 });
  });
});

it('unlocks achievements from a tally', () => {
  const totals = { points: 0, filled: 12, records: 10, added: 0, byGap: { 'game:about': 6, 'event:about': 4 }, publishers: 0, milestones: 0, missions: 1 };
  expect(achievementsOf(totals).map((a) => a.name)).toEqual(['First find', 'First mission', 'Fact finder', 'Archivist']);
});

// #377: locked badges show how far there is to go.
it('measures progress towards every achievement, capped at its target', () => {
  const totals = { points: 0, filled: 12, records: 7, added: 0, byGap: { 'organization:place': 3 }, publishers: 0, milestones: 0, missions: 60 };
  const progress = achievementProgress(totals);
  expect(progress).toHaveLength(ACHIEVEMENTS.length);
  const of = (key) => progress.find((a) => a.key === key);
  expect(of('records-10')).toMatchObject({ value: 7, target: 10, earned: false, tier: 'silver' });
  expect(of('missions-50')).toMatchObject({ value: 50, target: 50, earned: true });
  expect(of('cartographer')).toMatchObject({ value: 3, earned: false });
  expect(of('records-1000').tier).toBe('platinum');
  // The same verdicts as achievementsOf.
  expect(progress.filter((a) => a.earned).map((a) => a.key)).toEqual(achievementsOf(totals).map((a) => a.key));
});
