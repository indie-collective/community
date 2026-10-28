// Which years /rewind covers (#348). A year's rewind opens in December, so
// it's ready for the holidays; before that, /rewind shows the year before.

export const FIRST_REWIND_YEAR = 2016;

/** The latest year with a rewind, at `now`. */
export const latestRewindYear = (now = new Date()) =>
  now.getUTCMonth() === 11 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

/** The year in a /rewind/:year URL, or null when there's no rewind for it. */
export function rewindYear(param, now = new Date()) {
  if (!/^\d{4}$/.test(param ?? '')) return null;
  const year = Number(param);
  return year >= FIRST_REWIND_YEAR && year <= latestRewindYear(now) ? year : null;
}
