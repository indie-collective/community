/**
 * The events diary's calendar: months, weeks and which days events fall on,
 * as plain "2026-11-05" strings. An event's days are in its own time zone
 * (#204), so it sits on the same squares for every visitor. Weeks start on
 * Monday.
 */
import { dateToZonedInput } from './eventTime';

const DAY = 24 * 60 * 60 * 1000;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Events past this many rows in a week are counted on their days instead.
export const MAX_LANES = 3;

const toTime = (day) => {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
};
const toDay = (time) => new Date(time).toISOString().slice(0, 10);

export const addDays = (day, days) => toDay(toTime(day) + days * DAY);

/** The month of a day: "2026-11-05" is "2026-11". */
export const monthOf = (day) => day.slice(0, 7);

/** `value` when it's a month ("2026-11"), or null. */
export const parseMonth = (value) => (MONTH.test(value ?? '') ? value : null);

export function shiftMonth(month, by) {
  const [year, number] = month.split('-').map(Number);
  return toDay(Date.UTC(year, number - 1 + by, 1)).slice(0, 7);
}

export const lastDayOf = (month) => addDays(`${shiftMonth(month, 1)}-01`, -1);
const monday = (day) =>
  addDays(day, -((new Date(toTime(day)).getUTCDay() + 6) % 7));

/** The first and last days a month's calendar shows, whole weeks. */
export function monthGridRange(month) {
  return {
    from: monday(`${month}-01`),
    to: addDays(monday(lastDayOf(month)), 6),
  };
}

/**
 * Instants certain to hold every event on those days, whatever its time zone:
 * time zones are at most a day from UTC.
 */
export function monthGridInstants(month) {
  const { from, to } = monthGridRange(month);
  return {
    from: new Date(toTime(from) - DAY),
    to: new Date(toTime(to) + 2 * DAY),
  };
}

/** The first and last day of an event, in its time zone. */
export function eventDays({
  starts_at: startsAt,
  ends_at: endsAt,
  time_zone: timeZone,
}) {
  const start = dateToZonedInput(startsAt, timeZone);
  const end = dateToZonedInput(endsAt ?? startsAt, timeZone);
  const first = start.slice(0, 10);
  const last = end.slice(0, 10);
  // Ending at midnight, it's over before that day starts.
  return {
    first,
    last: end.endsWith('T00:00') && last > first ? addDays(last, -1) : last,
  };
}

/** Whether an event falls on any day from `from` to `to`. */
export function eventOverlaps(event, from, to) {
  const { first, last } = eventDays(event);
  return first <= to && last >= from;
}

/**
 * A month's calendar, week by week. Each week has its seven days (`more`: the
 * events that didn't fit on that day) and the bars to draw across them:
 * `column` (1 to 7), `span` in days, `lane` (from 0), and whether the event
 * carries on before or after this week.
 */
export function monthGrid(month, events) {
  const { from, to } = monthGridRange(month);
  const placed = events
    .map((event) => ({ event, ...eventDays(event) }))
    .sort(
      (a, b) => a.first.localeCompare(b.first) || b.last.localeCompare(a.last)
    );

  const weeks = [];
  for (let start = from; start <= to; start = addDays(start, 7)) {
    const end = addDays(start, 6);
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return { date, inMonth: monthOf(date) === month, more: 0 };
    });
    // The last day taken in each lane.
    const lanes = [];
    const bars = [];
    for (const { event, first, last } of placed) {
      if (first > end || last < start) continue;
      const a = first < start ? start : first;
      const b = last > end ? end : last;
      const column = (toTime(a) - toTime(start)) / DAY;
      const span = (toTime(b) - toTime(a)) / DAY + 1;
      const lane = lanes.findIndex((taken) => taken < a);
      const row = lane === -1 ? lanes.length : lane;
      if (row >= MAX_LANES) {
        for (let i = column; i < column + span; i++) days[i].more += 1;
        continue;
      }
      lanes[row] = b;
      bars.push({
        event,
        column: column + 1,
        span,
        lane: row,
        startsBefore: first < start,
        endsAfter: last > end,
      });
    }
    weeks.push({ start, days, bars });
  }
  return weeks;
}

/**
 * Events under the headings of an agenda, in order: this week, next week,
 * then month by month. `key` is "thisWeek", "nextWeek" or a month.
 */
export function agendaGroups(events, today) {
  const thisWeekEnds = addDays(monday(today), 6);
  const nextWeekEnds = addDays(thisWeekEnds, 7);
  const groups = [];
  const sorted = events
    .map((event) => ({ event, ...eventDays(event) }))
    .sort((a, b) => a.first.localeCompare(b.first));
  for (const { event, first } of sorted) {
    const key =
      first >= monday(today) && first <= thisWeekEnds
        ? 'thisWeek'
        : first > thisWeekEnds && first <= nextWeekEnds
          ? 'nextWeek'
          : monthOf(first);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.events.push(event);
    else groups.push({ key, events: [event] });
  }
  return groups;
}

const dateFormat = (locale, options) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options });

// "novembre" heads a page as "Novembre".
const capitalized = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** "November 2026", in `locale`. */
export const monthLabel = (month, locale) =>
  capitalized(
    dateFormat(locale, { month: 'long', year: 'numeric' }).format(
      toTime(`${month}-01`)
    )
  );

/** "November", in `locale`. */
export const monthName = (month, locale) =>
  capitalized(
    dateFormat(locale, { month: 'long' }).format(toTime(`${month}-01`))
  );

/** "Thursday 5 November" or locale's equivalent. */
export const dayLabel = (day, locale) =>
  dateFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    toTime(day)
  );

/** "Mon" to "Sun", in `locale`. */
export const weekdayLabels = (locale) =>
  // 2 November 2026 is a Monday.
  Array.from({ length: 7 }, (_, i) =>
    dateFormat(locale, { weekday: 'short' }).format(Date.UTC(2026, 10, 2 + i))
  );
