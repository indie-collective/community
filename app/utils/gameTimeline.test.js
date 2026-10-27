import { describe, expect, it } from 'vitest';

import {
  buildTimeline,
  formatDuration,
  formatMilestoneDate,
  milestoneDate,
  milestonesText,
  timeToRelease,
} from './gameTimeline';

const utc = (y, m = 1, d = 1) => new Date(Date.UTC(y, m - 1, d));

describe('milestoneDate', () => {
  it('keeps as much of the date as is known', () => {
    expect(milestoneDate('2021', '', '')).toEqual({ date: utc(2021), precision: 'year' });
    expect(milestoneDate('2021', '3', '')).toEqual({ date: utc(2021, 3), precision: 'month' });
    expect(milestoneDate('2021', '3', '14')).toEqual({ date: utc(2021, 3, 14), precision: 'day' });
  });

  it.each([
    ['', '', ''],
    ['nope', '', ''],
    ['1969', '', ''],
    ['2021', '13', ''],
    ['2021', '2', '30'],
    ['2021', '', '5'],
  ])('refuses %j %j %j', (year, month, day) => {
    expect(milestoneDate(year, month, day)).toBeNull();
  });
});

describe('formatMilestoneDate', () => {
  it('says only what is known', () => {
    expect(formatMilestoneDate(utc(2021, 3, 14), 'year')).toBe('2021');
    expect(formatMilestoneDate(utc(2021, 3, 14), 'month')).toBe('March 2021');
    expect(formatMilestoneDate(utc(2021, 3, 14), 'day')).toBe('14 March 2021');
  });
});

describe('formatDuration', () => {
  it.each([
    [0, ''],
    [1, '1 month'],
    [12, '1 year'],
    [28, '2 years 4 months'],
  ])('%i months is %j', (months, text) => {
    expect(formatDuration(months)).toBe(text);
  });
});

describe('buildTimeline', () => {
  const milestones = [
    { id: 'r', kind: 'released', date: utc(2023, 6).getTime(), date_precision: 'month', note: null },
    { id: 'a', kind: 'announced', date: utc(2021, 2).getTime(), date_precision: 'month', note: 'at a showcase' },
  ];
  const events = [{ id: 'e', name: 'Indie Fest', starts_at: utc(2022, 5, 20), ends_at: utc(2022, 5, 22) }];

  it('puts milestones and events in order, with the months since the first', () => {
    const entries = buildTimeline({ milestones, events });
    expect(entries.map(({ id, since }) => [id, since])).toEqual([
      ['a', 0],
      ['e', 15],
      ['r', 28],
    ]);
    expect(entries[1]).toMatchObject({ type: 'event', precision: 'day' });
    expect(timeToRelease(entries)).toBe('2 years 4 months');
  });

  it("uses IGDB's release date only without a release milestone", () => {
    const igdbReleaseDate = utc(2023, 9).getTime() / 1000;
    expect(buildTimeline({ milestones, igdbReleaseDate }).some(({ type }) => type === 'release')).toBe(false);

    const entries = buildTimeline({ milestones: [milestones[1]], igdbReleaseDate });
    expect(entries.at(-1)).toMatchObject({ type: 'release', since: 31 });
    expect(timeToRelease(entries)).toBe('2 years 7 months');
  });

  it('puts milestones before events on the same day', () => {
    const day = utc(2022, 5, 20).getTime();
    const entries = buildTimeline({
      milestones: [{ id: 'd', kind: 'demo', date: day, date_precision: 'day' }],
      events,
    });
    expect(entries.map(({ id }) => id)).toEqual(['d', 'e']);
  });

  it('is empty without anything dated, and has no time to release', () => {
    expect(buildTimeline({})).toEqual([]);
    expect(timeToRelease([])).toBeNull();
    // Released first: nothing came before it.
    expect(timeToRelease(buildTimeline({ milestones: [milestones[0]] }))).toBeNull();
  });
});

describe('milestonesText', () => {
  it('lists them oldest first, one per line', () => {
    expect(
      milestonesText([
        { kind: 'released', date: utc(2023, 6).getTime(), date_precision: 'month' },
        { kind: 'announced', date: utc(2021).getTime(), date_precision: 'year', note: 'at a showcase' },
      ])
    ).toBe('2021: Announced (at a showcase)\nJune 2023: Released\n');
  });
});
