// Atom feeds of what's new (#342): games, events and organisations.
import { summarize } from './meta';

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * An Atom feed. `entries` are `{ title, url, summary, published, updated,
 * image, id }` (`id` defaults to `url`), newest first; `self` is the feed's
 * own URL.
 */
export function atomFeed({ title, self, site, entries }) {
  const updated = entries[0]?.updated ?? entries[0]?.published ?? new Date(0);
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <id>${escapeXml(self)}</id>
  <link rel="self" href="${escapeXml(self)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(site)}"/>
  <updated>${new Date(updated).toISOString()}</updated>
  <author><name>Indie Collective</name></author>
${entries
  .map(
    (entry) => `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <id>${escapeXml(entry.id ?? entry.url)}</id>
    <link rel="alternate" type="text/html" href="${escapeXml(entry.url)}"/>
    <published>${new Date(entry.published).toISOString()}</published>
    <updated>${new Date(entry.updated ?? entry.published).toISOString()}</updated>
    <summary>${escapeXml(summarize(entry.summary, 500))}</summary>${
      entry.image ? `\n    <link rel="enclosure" type="image/webp" href="${escapeXml(entry.image)}"/>` : ''
    }
  </entry>`
  )
  .join('\n')}
</feed>
`;
}

export const feedResponse = (xml) =>
  new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
