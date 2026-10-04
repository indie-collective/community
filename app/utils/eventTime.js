/**
 * Event dates and times, always in the event's own time zone (#204): 14:00 at
 * a Rennes event is 14:00 for every visitor. Used on the server and in the
 * browser, which must produce the same strings for hydration, so nothing here
 * depends on the process' time zone or locale.
 */

/** Zone for events without one (no location yet). */
export const DEFAULT_TIME_ZONE = 'Europe/Paris';
const LOCALE = 'en';

function validZone(timeZone) {
  if (!timeZone) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat(LOCALE, { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

// ICU puts narrow and thin no-break spaces in some formats, and Node's and
// browsers' ICU versions don't always agree on which: plain spaces only.
const plain = (text) => text.replace(/[   ]/g, ' ');

function parts(date, timeZone) {
  const values = {};
  for (const { type, value } of new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)) {
    values[type] = value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

/** How far `timeZone` is ahead of UTC at `date`, in milliseconds. */
function offset(date, timeZone) {
  const p = parts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - (date.getTime() - date.getMilliseconds());
}

/**
 * "Oct 23, 14:00", with the year when it isn't `now`'s ("May 22, 2025, 10:00").
 * `time: false` leaves out the time.
 */
export function formatEventDate(date, timeZone, { now = new Date(), time = true } = {}) {
  if (!date) return '';
  const zone = validZone(timeZone);
  const value = new Date(date);
  const showYear = parts(value, zone).year !== parts(new Date(now), zone).year;
  return plain(
    new Intl.DateTimeFormat(LOCALE, {
      timeZone: zone,
      month: 'short',
      day: 'numeric',
      ...(showYear && { year: 'numeric' }),
      ...(time && { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    }).format(value)
  );
}

/** The month ("Oct") and day of month (23) of `date` in `timeZone`. */
export function formatEventDay(date, timeZone) {
  if (!date) return null;
  const zone = validZone(timeZone);
  const value = new Date(date);
  return {
    month: new Intl.DateTimeFormat(LOCALE, { timeZone: zone, month: 'short' }).format(value),
    day: parts(value, zone).day,
  };
}

/**
 * "Oct 23, 14:00 – 20:00" on one day, "Oct 23, 14:00 – Oct 25, 20:00" across
 * days; with `time: false`, "Oct 23" or "Oct 23 – Oct 25".
 */
export function formatEventRange(start, end, timeZone, options = {}) {
  if (!end) return formatEventDate(start, timeZone, options);
  const zone = validZone(timeZone);
  const a = parts(new Date(start), zone);
  const b = parts(new Date(end), zone);
  const sameDay = a.year === b.year && a.month === b.month && a.day === b.day;
  if (options.time === false && sameDay) return formatEventDate(start, zone, options);
  const endText = sameDay && options.time !== false
    ? `${String(b.hour).padStart(2, '0')}:${String(b.minute).padStart(2, '0')}`
    : formatEventDate(end, zone, options);
  return `${formatEventDate(start, zone, options)} – ${endText}`;
}

/** An instant as a `datetime-local` value ("2026-10-23T14:00") in `timeZone`. */
export function dateToZonedInput(date, timeZone) {
  if (!date) return '';
  const p = parts(new Date(date), validZone(timeZone));
  const pad = (n) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * A `datetime-local` value read as wall-clock time in `timeZone`, as an
 * instant; null when it isn't one. Doesn't use the process' time zone, so the
 * server's own zone can't shift event times (#204).
 */
export function zonedInputToDate(value, timeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '');
  if (!match) return null;
  const zone = validZone(timeZone);
  const [y, mo, d, h, mi, s] = match.slice(1).map((n) => Number(n ?? 0));
  const wall = Date.UTC(y, mo - 1, d, h, mi, s);
  // Subtract the zone's offset; check it again at the result, in case the
  // guess landed on the other side of a daylight-saving change.
  let instant = wall - offset(new Date(wall), zone);
  const corrected = wall - offset(new Date(instant), zone);
  if (corrected !== instant) instant = corrected;
  return new Date(instant);
}
