// The shapes the data modules return (#151, part 3). D1 rows follow ADR
// 0003 (locations and images as columns, plural tables); routes and models
// still read the shapes they got from Prisma (`location`, `logo`,
// `game_entity`, snake_case fields). These turn one into the other, so the
// routes don't change.
import { searchText } from '../db/searchText.js';

/**
 * An image column set as the old `image` row: `{ id, image_file: { name } }`,
 * which utils/imageLinks turns into URLs. The key stands in for the ID.
 */
export function image(key, id = key) {
  return key ? { id, image_file: { name: key } } : null;
}

/** A row's location columns as the old `location` row, or null. */
export function location(row) {
  if (
    [
      row.countryCode,
      row.region,
      row.city,
      row.street,
      row.latitude,
      row.longitude,
    ].every((value) => value == null)
  ) {
    return null;
  }
  return {
    country_code: row.countryCode,
    region: row.region,
    city: row.city,
    street: row.street,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

/**
 * The old location fields (`country_code`, …) as columns. Undefined when
 * there's no location to set, so an update keeps the current one.
 */
export function locationColumns(place) {
  if (!place || !Object.values(place).some((value) => value != null)) {
    return undefined;
  }
  return {
    countryCode: place.country_code ?? null,
    region: place.region ?? null,
    city: place.city ?? null,
    street: place.street ?? null,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
  };
}

const times = (row) => ({
  created_at: row.createdAt,
  updated_at: row.updatedAt,
});

/** A person as the old `person` row, with `avatar` as an image. */
export function person(row) {
  if (!row) return row;
  return {
    id: row.id,
    username: row.username,
    first_name: row.firstName,
    last_name: row.lastName,
    about: row.about,
    email: row.email,
    discord_id: row.discordId,
    did: row.did,
    isAdmin: row.role === 'admin',
    role: row.role,
    avatar_oauth: row.avatarUrl,
    avatar_id: row.avatarKey,
    avatar: image(row.avatarKey),
    ...times(row),
  };
}

/** An organisation as the old `entity` row, with `location` and `logo`. */
export function organization(row) {
  if (!row) return row;
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    name: row.name,
    about: row.about,
    site: row.site,
    bsky_handle: row.bskyHandle,
    lastModifiedById: row.lastModifiedById,
    location: location(row),
    logo: image(row.logoKey),
    ...times(row),
  };
}

/** A game as the old `game` row (relations are added by the caller). */
export function game(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    about: row.about,
    site: row.site,
    igdb_slug: row.igdbSlug,
    deleted: row.deletedAt != null,
    lastModifiedById: row.lastModifiedById,
    ...times(row),
  };
}

/** An event as the old `event` row, with `location` and `cover`. */
export function event(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    about: row.about,
    site: row.site,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
    time_zone: row.timeZone,
    status: row.status,
    lastModifiedById: row.lastModifiedById,
    location: location(row),
    cover: image(row.coverKey),
    ...times(row),
  };
}

/** A game's stored IGDB data as the old `game_igdb` row, or null. */
export function igdb(row) {
  if (!row) return null;
  return {
    game_id: row.gameId,
    slug: row.slug,
    data: row.data,
    fetched_at: row.fetchedAt,
    refresh_started_at: row.refreshStartedAt,
  };
}

/** A game image row as the old `game_image`, with its `image`. */
export function gameImage(row) {
  return {
    game_id: row.gameId,
    image_id: row.id,
    created_at: row.createdAt,
    image: image(row.key, row.id),
  };
}

/** A tag as the old `tag` row. */
export function tag(row) {
  return { id: row.id, name: row.name, ...times(row) };
}

/** The search text for a game, organisation or event's fields. */
export const searchTextOf = ({ name, about }) => searchText(name, about);
