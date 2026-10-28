// Telling when two records are the same game, organisation or event (#346).

// Words that don't tell studios or games apart: "Studio X" is "X Games".
const FILLER = new Set([
  'the', 'a', 'an', 'le', 'la', 'les', 'l', 'de', 'des', 'du',
  'studio', 'studios', 'game', 'games', 'gaming', 'interactive', 'entertainment',
  'productions', 'production', 'digital', 'software', 'team',
  'ltd', 'llc', 'inc', 'sas', 'sarl', 'gmbh', 'srl', 'bv', 'ab', 'oy', 'co',
  'association', 'asso', 'collective', 'collectif',
]);

/**
 * A name reduced to what tells it apart: lowercase, without accents,
 * punctuation or filler words ("Studio Héros & Co." → "heros"). Empty when
 * nothing is left, so such names never match.
 */
export function nameKey(name) {
  const words = String(name ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const kept = words.filter((word) => !FILLER.has(word));
  return kept.join(' ');
}

// Hosts that many records share: their path tells records apart.
const SHARED_HOSTS = [
  'store.steampowered.com', 'steamcommunity.com', 'itch.io', 'www.facebook.com', 'facebook.com',
  'twitter.com', 'x.com', 'www.instagram.com', 'instagram.com', 'www.youtube.com', 'youtube.com',
  'linktr.ee', 'bsky.app', 'www.linkedin.com', 'linkedin.com', 'discord.gg', 'github.com',
  'play.google.com', 'apps.apple.com', 'www.kickstarter.com', 'www.eventbrite.com', 'www.meetup.com', 'lu.ma',
];

/**
 * A website reduced to what identifies it: host without www and path
 * without trailing slash, query or hash ("https://www.x.com/a/" → "x.com/a").
 * Just the host for an organisation's site of its own; with the path on
 * shared hosts (Steam, itch.io, social networks), and always with `exact`
 * (games: a studio's games can share its site, not a page). Null when it
 * isn't a URL.
 */
export function siteKey(site, { exact = false } = {}) {
  if (!site) return null;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const path = url.pathname.replace(/\/+$/, '').toLowerCase();
  const bare = host.replace(/^www\./, '');
  // A creator's itch.io page is theirs; its games are pages on it.
  if (host.endsWith('.itch.io') && !exact) return bare;
  return exact || SHARED_HOSTS.includes(host) ? `${bare}${path}` : bare;
}

/**
 * Pairs of records that look like the same one: same name key, same site,
 * or (for organisations) the same Bluesky handle; for events, the same name
 * key within a few days, or the same day and city. `records` are `{ id,
 * name, site, bsky_handle?, starts_at?, city? }`.
 *
 * @returns {{ a: string, b: string, reasons: string[] }[]} ids sorted in each pair
 */
export function suspectedPairs(records, { events = false, exactSites = false } = {}) {
  const pairs = new Map();
  const add = (a, b, reason) => {
    if (a.id === b.id) return;
    const [first, second] = [a.id, b.id].sort();
    const key = `${first}:${second}`;
    const pair = pairs.get(key) ?? { a: first, b: second, reasons: [] };
    if (!pair.reasons.includes(reason)) pair.reasons.push(reason);
    pairs.set(key, pair);
  };
  const groupBy = (keyOf, reason, accept = () => true) => {
    const groups = new Map();
    for (const record of records) {
      const key = keyOf(record);
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }
    for (const group of groups.values()) {
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          if (accept(group[i], group[j])) add(group[i], group[j], reason);
        }
      }
    }
  };
  const DAY = 86400000;
  const day = (record) => record.starts_at && new Date(record.starts_at).toISOString().slice(0, 10);
  if (events) {
    groupBy((r) => nameKey(r.name), 'same name', (x, y) => Math.abs(new Date(x.starts_at) - new Date(y.starts_at)) <= 7 * DAY);
    groupBy((r) => r.city && day(r) && `${r.city.toLowerCase()}:${day(r)}`, 'same day and city');
  } else {
    groupBy((r) => nameKey(r.name), 'same name');
    groupBy((r) => r.bsky_handle?.toLowerCase(), 'same Bluesky');
  }
  groupBy((r) => siteKey(r.site, { exact: exactSites }), 'same website');
  return [...pairs.values()];
}
