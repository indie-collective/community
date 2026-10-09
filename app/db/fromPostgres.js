// The one-off copy from Postgres to D1 (#151, ADR 0003): the old tables'
// rows, as the new tables' rows. Pure: scripts/copy-to-d1.mjs reads
// Postgres and writes D1. Rows use the new tables' column names.
import { searchText } from './searchText.js';

/** Unix milliseconds, or null. */
export const ms = (value) => (value == null ? null : new Date(value).getTime());

// Old table names in the change log, as the new ones.
const CHANGED_TABLES = {
  game: 'games',
  entity: 'organizations',
  event: 'events',
};

/** An `image` row as `<prefix>_key`, `_width` and `_height`, all null without a file. */
export function imageColumns(prefix, image) {
  const file = image?.image_file ?? {};
  const key = file.name ?? null;
  return {
    [`${prefix}_key`]: key,
    [`${prefix}_width`]: key && Number.isFinite(file.width) ? file.width : null,
    [`${prefix}_height`]:
      key && Number.isFinite(file.height) ? file.height : null,
  };
}

/** A `location` row as the location columns, all null without one. */
export function locationColumns(location) {
  return {
    country_code: location?.country_code ?? null,
    region: location?.region ?? null,
    city: location?.city ?? null,
    street: location?.street ?? null,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
  };
}

const times = (row) => ({
  created_at: ms(row.created_at) ?? ms(row.updated_at) ?? 0,
  updated_at: ms(row.updated_at) ?? ms(row.created_at) ?? 0,
});

/**
 * Only the people named in `admins` (usernames) are admins; everyone else,
 * Discord-role admins included, is a member (#153, decided 2026-10-09).
 */
export function person(row, avatar, admins = new Set()) {
  return {
    id: row.id,
    username: row.username,
    first_name: row.first_name,
    last_name: row.last_name,
    about: row.about,
    email: row.email,
    ...imageColumns('avatar', avatar),
    avatar_url: row.avatar_oauth ?? null,
    role: admins.has(row.username) ? 'admin' : 'member',
    did: null,
    discord_id: row.discord_id,
    ...times(row),
  };
}

export function organization(row, location, logo) {
  return {
    id: row.id,
    type: row.type,
    status: row.status ?? 'active',
    name: row.name,
    about: row.about,
    site: row.site,
    bsky_handle: row.bsky_handle ?? null,
    ...locationColumns(location),
    ...imageColumns('logo', logo),
    search_text: searchText(row.name, row.about),
    deleted_at: null,
    last_modified_by_id: row.lastModifiedById ?? null,
    ...times(row),
  };
}

export function game(row) {
  return {
    id: row.id,
    name: row.name,
    about: row.about,
    site: row.site,
    igdb_slug: row.igdb_slug,
    search_text: searchText(row.name, row.about),
    // Deleted games kept no deletion time; their last update is the closest.
    deleted_at: row.deleted ? (ms(row.updated_at) ?? ms(row.created_at)) : null,
    last_modified_by_id: row.lastModifiedById ?? null,
    ...times(row),
  };
}

export function event(row, location, cover) {
  return {
    id: row.id,
    name: row.name,
    about: row.about,
    site: row.site,
    starts_at: ms(row.starts_at),
    ends_at: ms(row.ends_at),
    time_zone: row.time_zone ?? 'Europe/Paris',
    status: row.status ?? 'ongoing',
    ...locationColumns(location),
    ...imageColumns('cover', cover),
    search_text: searchText(row.name, row.about),
    deleted_at: null,
    last_modified_by_id: row.lastModifiedById ?? null,
    ...times(row),
  };
}

/**
 * A game's images (`game_image` joined to `image`), in the order they were
 * added, numbered from 0. Images without a file are left out.
 */
export function gameImages(links, imagesById) {
  const byGame = new Map();
  for (const link of links) {
    const image = imagesById.get(link.image_id);
    if (!image?.image_file?.name) continue;
    byGame.set(link.game_id, [
      ...(byGame.get(link.game_id) ?? []),
      { link, image },
    ]);
  }
  return [...byGame.values()].flatMap((list) =>
    list
      .sort(
        (a, b) =>
          (ms(a.link.created_at) ?? 0) - (ms(b.link.created_at) ?? 0) ||
          a.image.id.localeCompare(b.image.id)
      )
      .map(({ link, image }, position) => {
        const { image_key, image_width, image_height } = imageColumns(
          'image',
          image
        );
        return {
          id: image.id,
          game_id: link.game_id,
          key: image_key,
          width: image_width,
          height: image_height,
          position,
          created_at: ms(link.created_at) ?? ms(image.created_at) ?? 0,
        };
      })
  );
}

export function change(row) {
  return {
    id: row.id,
    operation: row.operation,
    table_name: CHANGED_TABLES[row.table_name] ?? row.table_name,
    record_id: row.record_id,
    // Kept as recorded: the old columns, as history pages show them.
    data: JSON.stringify(row.data ?? {}),
    author_id: row.author_id ?? null,
    created_at: ms(row.created_at) ?? 0,
  };
}

/** A join or simple row with its timestamps in milliseconds. */
export const withTimes = (row, columns) =>
  Object.fromEntries(
    Object.entries(columns).map(([to, from]) => [
      to,
      /_at$/.test(to) ? (ms(row[from]) ?? 0) : row[from],
    ])
  );
