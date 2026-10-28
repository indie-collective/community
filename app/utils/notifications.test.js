import { describe, expect, it } from 'vitest';

import { noticesFor } from './notifications';

describe('noticesFor', () => {
  it('tells a studio’s followers about a game it made or published, and the game’s about its publisher', () => {
    expect(
      noticesFor({
        operation: 'update',
        kind: 'game',
        recordId: 'g1',
        before: { organizations: [{ organization_id: 'o1', role: 'developer' }] },
        after: {
          organizations: [
            { organization_id: 'o1', role: 'developer' },
            { organization_id: 'o2', role: 'publisher' },
          ],
        },
      })
    ).toEqual([
      { audience: { type: 'organization', id: 'o2' }, kind: 'org_game', refs: { organization: 'o2', game: 'g1', role: 'publisher' } },
      { audience: { type: 'game', id: 'g1' }, kind: 'game_publisher', refs: { game: 'g1', organization: 'o2' } },
    ]);
  });

  it('tells a game’s followers about a new step and an event, and the event’s', () => {
    const notices = noticesFor({
      operation: 'update',
      kind: 'game',
      recordId: 'g1',
      before: { milestones: [], event_ids: [] },
      after: { milestones: [{ kind: 'demo', date: 1 }], event_ids: ['e1'] },
    });
    expect(notices.map((n) => [n.audience.type, n.kind])).toEqual([
      ['game', 'game_milestone'],
      ['game', 'game_event'],
      ['event', 'event_game'],
    ]);
  });

  it('tells a country’s followers about new events and organisations there, and hosts’ followers', () => {
    expect(
      noticesFor({ operation: 'create', kind: 'event', recordId: 'e1', after: { country_code: 'FR', organization_ids: ['o1'], game_ids: [] } }).map(
        (n) => [n.audience, n.kind]
      )
    ).toEqual([
      [{ type: 'country', id: 'FR' }, 'new_event'],
      [{ type: 'organization', id: 'o1' }, 'org_event'],
    ]);
    expect(noticesFor({ operation: 'create', kind: 'organization', recordId: 'o1', after: { country_code: null } })).toEqual([]);
  });

  it('tells an event’s followers when its dates, place or status change, not its description', () => {
    expect(noticesFor({ operation: 'update', kind: 'event', recordId: 'e1', after: { about: 'x' } })).toEqual([]);
    expect(noticesFor({ operation: 'update', kind: 'event', recordId: 'e1', after: { status: 'canceled' } })[0]).toEqual({
      audience: { type: 'event', id: 'e1' },
      kind: 'event_changed',
      refs: { event: 'e1', canceled: true, fields: ['status'] },
    });
  });

  it('tells followers of who posted an opportunity, and nobody about deletions', () => {
    expect(noticesFor({ operation: 'create', kind: 'opportunity', recordId: 'p1', after: { game_id: 'g1' } })).toEqual([
      { audience: { type: 'game', id: 'g1' }, kind: 'opportunity', refs: { opportunity: 'p1', game: 'g1' } },
    ]);
    expect(noticesFor({ operation: 'delete', kind: 'game', recordId: 'g1', before: { organizations: [] }, after: {} })).toEqual([]);
  });
});
