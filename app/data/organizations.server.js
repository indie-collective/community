// Organisations (studios and associations): every read and write the
// routes make (#151, part 2). The only place that knows how they're stored;
// the D1 port reimplements these functions with the same results.
import { db } from '../utils/db.server';
import computeOrg from '../models/org';
import { getFullTextSearchQuery } from '../utils/search.server';

/**
 * One page of studios or associations, and the countries they're in.
 * `city` matches case-insensitively (#258); `hasGames` and `hasEvents`
 * keep only those with some.
 *
 * @returns {Promise<{ orgs: object[], hasMore: boolean, countries: object[] }>}
 *   computed orgs (see models/org); countries as `{ country_code, _count }`
 */
export async function listOrganizations({
  type,
  page = 1,
  pageSize = 50,
  country = null,
  city = null,
  hasGames = false,
  hasEvents = false,
}) {
  const where = {
    type,
    ...((country || city) && {
      location: {
        ...(country && { country_code: country }),
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
      },
    }),
    ...(hasGames && { game_entity: { some: {} } }),
    ...(hasEvents && { entity_event: { some: {} } }),
  };

  const [orgs, countries] = await Promise.all([
    db.entity.findMany({
      where,
      include: { location: true, logo: true },
      // id last, so pages don't overlap when updated_at ties.
      orderBy: [{ updated_at: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      // One extra row tells whether there's a next page.
      take: pageSize + 1,
    }),
    db.location.groupBy({
      by: ['country_code'],
      where: { entity: { some: { type } } },
      _count: true,
      orderBy: { _count: { country_code: 'desc' } },
    }),
  ]);

  return {
    orgs: await Promise.all(orgs.slice(0, pageSize).map(computeOrg)),
    hasMore: orgs.length > pageSize,
    countries,
  };
}

/** The most recently updated organisations of either type (/orgs). */
export async function listRecentOrganizations({ limit }) {
  const orgs = await db.entity.findMany({
    include: { location: true, logo: true },
    orderBy: { updated_at: 'desc' },
    take: limit,
  });
  return Promise.all(orgs.map(computeOrg));
}

/**
 * An organisation for its page: with its location, logo, games (newest
 * first, deleted ones left out) and hosted events (latest first), or null.
 */
export async function getOrganization(id) {
  const org = await db.entity.findUnique({
    where: { id },
    include: {
      game_entity: {
        where: { game: { deleted: false } },
        include: {
          game: {
            include: { igdb: true, game_image: { include: { image: true } } },
          },
        },
        orderBy: { game: { created_at: 'desc' } },
      },
      entity_event: {
        include: {
          event: {
            include: {
              game_event: { where: { game: { deleted: false } } },
              event_participant: true,
              cover: true,
            },
          },
        },
        orderBy: { event: { ends_at: 'desc' } },
      },
      logo: true,
      location: true,
    },
  });
  return org ? computeOrg(org) : null;
}

/**
 * An organisation for its edit form, or null: its fields, location, and
 * logo as `{ url, thumbnail_url }`.
 */
export async function getOrganizationForEdit(id) {
  const org = await db.entity.findUnique({
    where: { id },
    include: { logo: true, location: true },
  });
  if (!org) return null;
  return {
    ...org,
    logo: org.logo
      ? {
          url: `https://${process.env.CDN_HOST}/${org.logo.image_file.name}`,
          thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${org.logo.image_file.name}`,
        }
      : null,
  };
}

// The location fields as a Prisma relation input: the same place is
// reused rather than duplicated; none when every field is empty.
function locationInput(location) {
  if (!location || !Object.values(location).some((value) => value !== null))
    return undefined;
  return {
    connectOrCreate: {
      where: { street_city_region_country_code_latitude_longitude: location },
      create: location,
    },
  };
}

/**
 * Creates an organisation.
 * @param {{ name, type, site, bskyHandle, about, location, logoId }} fields
 *   `location` holds street, city, region, country_code, latitude, longitude;
 *   `logoId` is an uploaded image's ID
 * @returns {Promise<{ id: string }>}
 */
export async function createOrganization({
  name,
  type,
  site,
  bskyHandle,
  about,
  location,
  logoId,
}) {
  return db.entity.create({
    data: {
      name,
      type,
      site,
      bsky_handle: bskyHandle,
      about,
      location: locationInput(location),
      logo: logoId ? { connect: { id: logoId } } : undefined,
    },
    select: { id: true },
  });
}

/**
 * Updates an organisation; a missing logo or empty location leaves the
 * current one.
 * @returns {Promise<{ id: string }>}
 */
export async function updateOrganization(
  id,
  { name, type, site, bskyHandle, about, location, logoId, authorId }
) {
  return db.entity.update({
    where: { id },
    data: {
      name,
      lastModifiedById: authorId,
      type,
      site,
      bsky_handle: bskyHandle,
      about,
      location: locationInput(location),
      logo: logoId ? { connect: { id: logoId } } : undefined,
    },
    select: { id: true },
  });
}

/** Deletes an organisation. */
export async function deleteOrganization(id) {
  await db.entity.delete({ where: { id } });
}

/**
 * Organisations whose name matches `q`, for pickers: `{ id, name }`, at
 * most 10. Empty for an empty query.
 */
export async function searchOrganizations(q, { excludeIds = [] } = {}) {
  const search = getFullTextSearchQuery(q);
  if (!search) return [];
  return db.entity.findMany({
    where: { name: { search }, id: { notIn: excludeIds } },
    select: { id: true, name: true },
    take: 10,
  });
}

/** The newest studios or associations (the home page), computed. */
export async function listNewOrganizations({ type, limit }) {
  const orgs = await db.entity.findMany({
    where: { type },
    include: { location: true, logo: true },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
  return Promise.all(orgs.map(computeOrg));
}

/** Every organisation with a location, computed, for the map. */
export async function listMappedOrganizations() {
  const orgs = await db.entity.findMany({
    where: { location: { isNot: null } },
    include: { location: true, logo: true },
  });
  return Promise.all(orgs.map(computeOrg));
}

/** Where organisations are, as `[latitude, longitude]`, one per located org. */
export async function listOrganizationPoints() {
  const orgs = await db.entity.findMany({
    where: { location: { isNot: null } },
    select: { location: { select: { latitude: true, longitude: true } } },
  });
  return orgs.map(({ location }) => [location.latitude, location.longitude]);
}

/** How many organisations there are. */
export function countOrganizations() {
  return db.entity.count();
}
