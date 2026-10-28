// The weekly Bluesky summary (#319): what was added to the site in the
// week, in one post on Monday morning instead of one per addition.

/** Whether `now` is Monday 09:00–09:59 in Paris: the hour the summary goes out. */
export function isWeeklySlot(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
      .formatToParts(now)
      .map(({ type, value }) => [type, value])
  );
  return parts.weekday === 'Mon' && Number(parts.hour) === 9;
}

/** The Monday (in Paris) that `now`'s week starts on, as "2026-10-26": the summary's key. */
export function weekKey(now = new Date()) {
  const paris = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const day = (paris.getDay() + 6) % 7;
  paris.setDate(paris.getDate() - day);
  const pad = (n) => String(n).padStart(2, '0');
  return `${paris.getFullYear()}-${pad(paris.getMonth() + 1)}-${pad(paris.getDate())}`;
}

const graphemes = (text) => [...new Intl.Segmenter().segment(text)].length;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);

/**
 * The post's text for the week's additions (`{ games, events, organizations }`,
 * names), within `max` graphemes: the counts, then as many names as fit,
 * with "and N more" for the rest. Null when nothing was added.
 */
export function weeklySummaryText({ games = [], events = [], organizations = [] }, { max = 250 } = {}) {
  const total = games.length + events.length + organizations.length;
  if (total === 0) return null;
  const counts = [
    games.length && plural(games.length, 'game', 'games'),
    events.length && plural(events.length, 'event', 'events'),
    organizations.length && plural(organizations.length, 'studio or association', 'studios and associations'),
  ].filter(Boolean);
  const head = `New on Indie Collective this week: ${list(counts)}.`;
  const names = [...games, ...events, ...organizations];
  // As many names as fit, then how many more there are.
  for (let shown = names.length; shown >= 0; shown -= 1) {
    const rest = names.length - shown;
    const tail = shown === 0 ? '' : ` ${names.slice(0, shown).join(', ')}${rest > 0 ? ` and ${rest} more` : ''}.`;
    const text = `${head}${tail}`;
    if (graphemes(text) <= max) return text;
  }
  return head;
}
