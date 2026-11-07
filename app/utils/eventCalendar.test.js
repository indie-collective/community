import { describe, expect, it } from 'vitest';

import {
  agendaGroups,
  eventDays,
  eventOverlaps,
  monthGrid,
  monthGridRange,
  parseMonth,
  shiftMonth,
  weekdayLabels,
} from './eventCalendar';

const event = (name, first, last = first, timeZone = 'UTC') => ({
  name,
  starts_at: new Date(`${first}T10:00:00Z`),
  ends_at: new Date(`${last}T12:00:00Z`),
  time_zone: timeZone,
});

describe('months', () => {
  it('reads only real months', () => {
    expect(parseMonth('2026-11')).toBe('2026-11');
    expect(parseMonth('2026-13')).toBeNull();
    expect(parseMonth('soon')).toBeNull();
    expect(parseMonth(null)).toBeNull();
  });

  it('moves across years', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('shows whole weeks, Monday to Sunday', () => {
    expect(monthGridRange('2026-11')).toEqual({
      from: '2026-10-26',
      to: '2026-12-06',
    });
  });

  it('names the weekdays from Monday', () => {
    expect(weekdayLabels('en')[0]).toBe('Mon');
    expect(weekdayLabels('en')[6]).toBe('Sun');
  });
});

describe('eventDays', () => {
  it('counts days in the event’s time zone', () => {
    const late = {
      starts_at: new Date('2026-11-05T23:30:00Z'),
      ends_at: new Date('2026-11-06T01:00:00Z'),
      time_zone: 'America/Los_Angeles',
    };
    expect(eventDays(late)).toEqual({
      first: '2026-11-05',
      last: '2026-11-05',
    });
    expect(eventDays({ ...late, time_zone: 'Europe/Paris' })).toEqual({
      first: '2026-11-06',
      last: '2026-11-06',
    });
  });

  it('leaves out the day an event ends at midnight', () => {
    expect(
      eventDays({
        starts_at: new Date('2026-11-05T18:00:00Z'),
        ends_at: new Date('2026-11-07T00:00:00Z'),
        time_zone: 'UTC',
      })
    ).toEqual({ first: '2026-11-05', last: '2026-11-06' });
  });

  it('tells which events fall in a range', () => {
    const fair = event('Fair', '2026-11-05', '2026-11-08');
    expect(eventOverlaps(fair, '2026-11-08', '2026-11-20')).toBe(true);
    expect(eventOverlaps(fair, '2026-11-09', '2026-11-20')).toBe(false);
  });
});

describe('monthGrid', () => {
  it('splits a long event across weeks', () => {
    const weeks = monthGrid('2026-11', [
      event('Con', '2026-11-07', '2026-11-10'),
    ]);
    const [first, second] = weeks.filter(({ bars }) => bars.length);
    expect(first.bars[0]).toMatchObject({
      column: 6,
      span: 2,
      lane: 0,
      startsBefore: false,
      endsAfter: true,
    });
    expect(second.bars[0]).toMatchObject({
      column: 1,
      span: 2,
      lane: 0,
      startsBefore: true,
      endsAfter: false,
    });
  });

  it('puts overlapping events in lanes, and reuses free ones', () => {
    const weeks = monthGrid('2026-11', [
      event('A', '2026-11-02', '2026-11-04'),
      event('B', '2026-11-03'),
      event('C', '2026-11-05'),
    ]);
    const lanes = Object.fromEntries(
      weeks[1].bars.map((bar) => [bar.event.name, bar.lane])
    );
    expect(lanes).toEqual({ A: 0, B: 1, C: 0 });
  });

  it('counts what doesn’t fit on its days', () => {
    const weeks = monthGrid('2026-11', [
      event('A', '2026-11-03'),
      event('B', '2026-11-03'),
      event('C', '2026-11-03'),
      event('D', '2026-11-03'),
    ]);
    expect(weeks[1].bars).toHaveLength(3);
    expect(weeks[1].days[1].more).toBe(1);
  });

  it('marks the days of other months', () => {
    const weeks = monthGrid('2026-11', []);
    expect(weeks[0].days[0]).toMatchObject({
      date: '2026-10-26',
      inMonth: false,
    });
    expect(weeks[0].days[6]).toMatchObject({
      date: '2026-11-01',
      inMonth: true,
    });
  });
});

describe('agendaGroups', () => {
  it('groups by this week, next week, then month', () => {
    const groups = agendaGroups(
      [
        event('Later', '2026-12-04'),
        event('Soon', '2026-11-08'),
        event('Next', '2026-11-12'),
        event('Far', '2026-11-27'),
      ],
      '2026-11-02'
    );
    expect(
      groups.map(({ key, events }) => [key, events.map(({ name }) => name)])
    ).toEqual([
      ['thisWeek', ['Soon']],
      ['nextWeek', ['Next']],
      ['2026-11', ['Far']],
      ['2026-12', ['Later']],
    ]);
  });
});
