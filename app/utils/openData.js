// The open data exports (#304): what's in them, field by field, for the
// files, their README and the /data page. Current data only: no people,
// no change history, deleted records left out; images by URL.

export const LICENCE = {
  name: 'Open Database License (ODbL) 1.0',
  url: 'https://opendatacommons.org/licenses/odbl/1-0/',
  attribution: 'Indie Collective community (https://community.indieco.xyz), its contributors',
};

const RECORD = [
  ['id', 'Stable identifier (UUID)'],
  ['slug', 'Its address on the site: /game/<slug>, /org/<slug>, /event/<slug>'],
  ['url', 'Its page on the site'],
];
const PLACE = [
  ['country_code', 'ISO 3166-1 alpha-2 country code'],
  ['region', 'Region'],
  ['city', 'City'],
  ['latitude', 'Latitude (WGS 84)'],
  ['longitude', 'Longitude (WGS 84)'],
];
const TIMES = [
  ['created_at', 'When it was added (ISO 8601, UTC)'],
  ['updated_at', 'When it last changed (ISO 8601, UTC)'],
];

/** Each CSV file: `[file, description, [[column, description]…]]`. */
export const FILES = [
  [
    'games.csv',
    'Indie games.',
    [...RECORD, ['name', 'Name'], ['about', 'Description (Markdown)'], ['site', 'Website, or its Steam or itch.io page'], ['igdb_slug', 'Its IGDB page: https://www.igdb.com/games/<igdb_slug>'], ...TIMES],
  ],
  [
    'organizations.csv',
    'Studios and associations.',
    [
      ...RECORD,
      ['type', 'studio or association'],
      ['status', 'active, hiatus or closed'],
      ['name', 'Name'],
      ['about', 'Description (Markdown)'],
      ['site', 'Website'],
      ['bsky_handle', 'Bluesky handle'],
      ...PLACE,
      ['logo_url', 'Its logo'],
      ...TIMES,
    ],
  ],
  [
    'events.csv',
    'Festivals, conventions, meetups and game jams.',
    [
      ...RECORD,
      ['name', 'Name'],
      ['about', 'Description (Markdown)'],
      ['site', 'Website'],
      ['ticket_url', 'Where to get tickets'],
      ['starts_at', 'Start (ISO 8601, UTC)'],
      ['ends_at', 'End (ISO 8601, UTC)'],
      ['time_zone', 'The IANA time zone it happens in'],
      ['status', 'ongoing or canceled'],
      ['attendance', 'in_person, online or hybrid'],
      ['online_url', 'Where to join online'],
      ['street', 'Street address'],
      ...PLACE,
      ['cover_url', 'Its cover image'],
      ['previous_edition_id', 'The events.csv id of the edition before it'],
      ...TIMES,
    ],
  ],
  ['tags.csv', 'Tags on games.', [['id', 'Stable identifier'], ['name', 'Tag']]],
  [
    'game_organizations.csv',
    'Who took part in which game, and how.',
    [['game_id', 'games.csv id'], ['organization_id', 'organizations.csv id'], ['role', 'developer, co_developer, publisher, porting or support']],
  ],
  ['game_tags.csv', 'Tags of each game.', [['game_id', 'games.csv id'], ['tag_id', 'tags.csv id']]],
  ['game_events.csv', 'Games shown at events.', [['game_id', 'games.csv id'], ['event_id', 'events.csv id']]],
  ['organization_events.csv', 'Who hosts each event.', [['organization_id', 'organizations.csv id'], ['event_id', 'events.csv id']]],
  [
    'game_milestones.csv',
    'Steps in each game’s life: announced, demo, released…',
    [
      ['game_id', 'games.csv id'],
      ['kind', 'announced, prototype, alpha, beta, demo, early_access, funded, signed, released, ported, update or other'],
      ['date', 'When (ISO 8601 date)'],
      ['date_precision', 'year, month or day: how much of the date is known'],
      ['note', 'A note'],
    ],
  ],
];

// A CSV value: quoted when it holds a comma, quote or line break (RFC 4180).
const cell = (value) => {
  if (value == null) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** A CSV file of `rows` (objects) with `columns` ([[name]…]), CRLF line ends. */
export const csv = (rows, columns) =>
  [columns.map(([name]) => name).join(','), ...rows.map((row) => columns.map(([name]) => cell(row[name])).join(','))]
    .map((line) => `${line}\r\n`)
    .join('');

/** The README in each export: what it is, its licence, and every field. */
export function readme(date) {
  return [
    `Indie Collective community: open data export of ${date}`,
    '',
    'The indie games, studios, associations and events of https://community.indieco.xyz,',
    'as they were that day. Updated every week; https://community.indieco.xyz/data has the latest.',
    '',
    `Licence: ${LICENCE.name}, ${LICENCE.url}`,
    `Credit: ${LICENCE.attribution}. Share what you make from it under the same licence.`,
    'Images and descriptions belong to their authors; images are linked, not included.',
    '',
    'Not included: members, their emails and accounts; the change history; deleted records.',
    '',
    'community.json holds the same records nested: games with their organisations, tags,',
    'events and milestones; events with their hosts and games.',
    '',
    ...FILES.flatMap(([file, description, columns]) => [
      `${file}: ${description}`,
      ...columns.map(([name, about]) => `  ${name}: ${about}`),
      '',
    ]),
  ].join('\n');
}
