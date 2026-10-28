import { describe, expect, it } from 'vitest';

import { isWeeklySlot, weekKey, weeklySummaryText } from './weeklySummary';

describe('isWeeklySlot', () => {
  it('is Monday at nine in Paris, summer and winter', () => {
    expect(isWeeklySlot(new Date('2026-10-26T08:17:00Z'))).toBe(true); // CET, UTC+1
    expect(isWeeklySlot(new Date('2026-06-01T07:17:00Z'))).toBe(true); // CEST, UTC+2
    expect(isWeeklySlot(new Date('2026-10-26T09:17:00Z'))).toBe(false);
    expect(isWeeklySlot(new Date('2026-10-27T08:17:00Z'))).toBe(false);
  });
});

it('keys a week by its Monday in Paris', () => {
  expect(weekKey(new Date('2026-10-26T08:17:00Z'))).toBe('2026-10-26');
  expect(weekKey(new Date('2026-11-01T22:30:00Z'))).toBe('2026-10-26'); // Sunday 23:30 in Paris
});

describe('weeklySummaryText', () => {
  it('says nothing when nothing was added', () => {
    expect(weeklySummaryText({})).toBeNull();
  });

  it('counts and names what was added', () => {
    expect(weeklySummaryText({ games: ['Héros'], events: ['Stunfest', 'GGJ'], organizations: [] })).toBe(
      'New on Indie Collective this week: 1 game and 2 events. Héros, Stunfest, GGJ.'
    );
  });

  it('names as many as fit, and says how many more', () => {
    const games = Array.from({ length: 40 }, (_, i) => `A game with a long name ${i}`);
    const text = weeklySummaryText({ games }, { max: 250 });
    expect([...new Intl.Segmenter().segment(text)].length).toBeLessThanOrEqual(250);
    expect(text).toMatch(/^New on Indie Collective this week: 40 games\. A game .* and \d+ more\.$/);
  });
});
