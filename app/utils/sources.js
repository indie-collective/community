// Reading records' pages elsewhere (#338): what kind of page a link is, and
// what it says about a game, an organisation or an event. Pure: the
// fetching is in utils/sourceFetch.server.

/** What a link is: `{ source, id }` (steam with its app ID, itch, bluesky with the handle, website). */
export function detectSource(url) {
  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const steam = host === 'store.steampowered.com' && /^\/app\/(\d+)/.exec(parsed.pathname);
  if (steam) return { source: 'steam', id: steam[1], url: `https://store.steampowered.com/app/${steam[1]}/` };
  if (host.endsWith('.itch.io')) return { source: 'itch', id: null, url: parsed.href };
  const bluesky = host === 'bsky.app' && /^\/profile\/([^/]+)/.exec(parsed.pathname);
  if (bluesky) return { source: 'bluesky', id: bluesky[1].toLowerCase(), url: parsed.href };
  return { source: 'website', id: null, url: parsed.href };
}

const decode = (text) =>
  String(text ?? '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();

const attribute = (tag, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return match ? decode(match[2] ?? match[3] ?? match[4]) : null;
};

// The JSON-LD items of a page, @graph flattened.
function jsonLd(html) {
  const items = [];
  for (const match of html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      for (const item of [parsed].flat()) items.push(...(item?.['@graph'] ?? [item]));
    } catch {
      // Broken JSON-LD: the page's other tags still count.
    }
  }
  return items.filter((item) => item && typeof item === 'object');
}

const types = (item) => [item['@type']].flat().filter(Boolean).map(String);
const isType = (item, pattern) => types(item).some((type) => pattern.test(type));
const text = (value) => (typeof value === 'string' ? decode(value) : null);
const absolute = (value, base) => {
  if (!value) return null;
  const url = typeof value === 'string' ? value : value.url ?? value['@id'] ?? null;
  try {
    return url ? new URL(url, base).href : null;
  } catch {
    return null;
  }
};

/**
 * What an HTML page says about itself: its meta tags (title, description,
 * image, site name), its links to Bluesky, and its JSON-LD items.
 */
export function parsePage(html, url) {
  const meta = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attribute(tag, 'property') ?? attribute(tag, 'name'))?.toLowerCase();
    const content = attribute(tag, 'content');
    if (key && content && !(key in meta)) meta[key] = content;
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const bluesky = /https?:\/\/bsky\.app\/profile\/([a-z0-9.-]+)/i.exec(html)?.[1]?.toLowerCase() ?? null;
  return {
    title: meta['og:title'] ?? meta['twitter:title'] ?? (title ? decode(title) : null),
    description: meta['og:description'] ?? meta.description ?? meta['twitter:description'] ?? null,
    image: absolute(meta['og:image'] ?? meta['twitter:image'], url),
    siteName: meta['og:site_name'] ?? null,
    bluesky,
    items: jsonLd(html),
  };
}

const place = (location) => {
  const where = [location].flat().find((l) => l && typeof l === 'object' && !isType(l, /VirtualLocation/));
  if (!where) return null;
  const address = typeof where.address === 'object' ? where.address : null;
  return {
    name: text(where.name),
    street: text(address?.streetAddress),
    city: text(address?.addressLocality),
    country_code: (() => {
      const country = typeof address?.addressCountry === 'object' ? address.addressCountry.name : address?.addressCountry;
      return typeof country === 'string' && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null;
    })(),
  };
};

// "2026-11-20T14:00:00+01:00" → wall-clock time where it happens, as a
// datetime-local value ("2026-11-20T14:00"), and the instant.
const when = (value) => {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(String(value ?? ''));
  if (!match) return null;
  const local = `${match[1]}T${match[2] ?? '00:00'}`;
  const instant = new Date(value);
  return { local, instant: Number.isNaN(instant.getTime()) ? null : instant.toISOString() };
};

/**
 * What a page says about a record of `kind` (game, organization, event):
 * the fields a form or a fill can take, from JSON-LD first, then meta tags.
 */
export function pageFields(page, kind, url) {
  const pattern = { game: /VideoGame|^Game$|SoftwareApplication/, organization: /Organization|Corporation|LocalBusiness/, event: /Event$/ }[kind];
  const item = page.items.find((candidate) => isType(candidate, pattern)) ?? {};
  const fields = {
    name: text(item.name) ?? page.title,
    about: text(item.description) ?? page.description,
    site: absolute(item.url, url) ?? url,
    image: absolute(item.image ?? item.logo, url) ?? page.image,
  };
  if (kind === 'organization') {
    const sameAs = [item.sameAs].flat().filter((link) => typeof link === 'string');
    fields.bsky_handle = sameAs.map((link) => /bsky\.app\/profile\/([^/?#]+)/i.exec(link)?.[1]).find(Boolean)?.toLowerCase() ?? page.bluesky;
    fields.place = item.address ? place({ address: item.address }) : null;
  }
  if (kind === 'event') {
    fields.starts_at = when(item.startDate);
    fields.ends_at = when(item.endDate);
    fields.place = place(item.location);
    const online = [item.location].flat().find((l) => l && isType(l, /VirtualLocation/));
    const mode = String(item.eventAttendanceMode ?? '');
    fields.attendance = /Mixed/.test(mode) ? 'hybrid' : /Online/.test(mode) || (online && !fields.place) ? 'online' : null;
    fields.online_url = absolute(online?.url, url);
    fields.ticket_url = absolute([item.offers].flat().find((offer) => offer?.url)?.url, url);
    fields.canceled = /EventCancelled/.test(String(item.eventStatus ?? ''));
  }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value != null && value !== ''));
}

/** A Steam app's details (the store's appdetails answer for `id`) as game fields. */
export function steamFields(answer, id) {
  const app = answer?.[id];
  if (!app?.success || !app.data) return null;
  const data = app.data;
  return Object.fromEntries(
    Object.entries({
      name: data.name,
      about: data.short_description ? decode(data.short_description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')) : null,
      site: data.website || `https://store.steampowered.com/app/${id}/`,
      image: data.header_image,
      developers: data.developers,
      publishers: data.publishers,
      coming_soon: data.release_date?.coming_soon,
      release_date: data.release_date?.date,
      genres: data.genres?.map((genre) => genre.description),
    }).filter(([, value]) => value != null && value !== '')
  );
}

/** A Bluesky profile (app.bsky.actor.getProfile) as organisation fields. */
export function blueskyFields(profile) {
  if (!profile?.handle) return null;
  return Object.fromEntries(
    Object.entries({
      name: profile.displayName,
      about: profile.description,
      image: profile.avatar,
      bsky_handle: profile.handle,
    }).filter(([, value]) => value != null && value !== '')
  );
}

// What a fill may copy into an empty field, by kind of record.
export const FILLABLE = {
  game: ['about', 'site'],
  organization: ['about', 'site', 'bsky_handle'],
  event: ['about', 'site', 'ticket_url'],
};

/**
 * What to copy from a source's `fields` into a record: only fields the record
 * has empty, that people never edited (`edited`, field names), and that the
 * kind of record can take.
 */
export function fillsFor(kind, record, fields, edited = []) {
  return Object.fromEntries(
    FILLABLE[kind]
      .filter((field) => (record[field] == null || record[field] === '') && !edited.includes(field) && fields[field])
      .map((field) => [field, fields[field]])
  );
}
