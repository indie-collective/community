// Organisations (studios and associations): every read and write the
// routes make (#151). The only place that knows how they're stored.
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  sql,
} from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  events,
  gameOrganizations,
  games,
  organizationEvents,
  organizations,
  gameTags,
  tags,
} from '../db/schema.js';
import computeOrg from '../models/org';
import getImageLinks from '../utils/imageLinks.server';
import { recordChange } from './changes.server';
import { assertSiteIsFree } from './duplicates.server';
import { imageColumns } from './images.server';
import { searchIndex } from './search.server';
import * as shape from './shapes.server';
import { freeSlug, renameSlugStatements } from './slugs.server';
import { slugify } from '../utils/slug';

const notDeleted = isNull(organizations.deletedAt);
// Located: the old location rows always had a country.
const located = isNotNull(organizations.countryCode);

// Rows in the order of `ids` (as search ranked them), missing ones left out.
const inOrder = (ids, rows) => {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

const computeAll = (rows) =>
  Promise.all(rows.map(shape.organization).map(computeOrg));

/**
 * One page of studios or associations, and the countries they're in.
 * `city` matches case-insensitively (#258); `hasGames` and `hasEvents`
 * keep only those with some.
 *
 * @returns {Promise<{ orgs: object[], hasMore: boolean, countries: object[] }>}
 *   computed orgs (see models/org); countries as `{ country_code, _count }`,
 *   most organisations first
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
  const where = and(
    notDeleted,
    eq(organizations.type, type),
    country ? eq(organizations.countryCode, country) : undefined,
    city ? sql`lower(${organizations.city}) = lower(${city})` : undefined,
    hasGames
      ? exists(
          db
            .select({ one: sql`1` })
            .from(gameOrganizations)
            .innerJoin(games, eq(games.id, gameOrganizations.gameId))
            .where(
              and(
                eq(gameOrganizations.organizationId, organizations.id),
                isNull(games.deletedAt)
              )
            )
        )
      : undefined,
    hasEvents
      ? exists(
          db
            .select({ one: sql`1` })
            .from(organizationEvents)
            .innerJoin(events, eq(events.id, organizationEvents.eventId))
            .where(
              and(
                eq(organizationEvents.organizationId, organizations.id),
                isNull(events.deletedAt)
              )
            )
        )
      : undefined
  );

  const [rows, countries] = await Promise.all([
    db
      .select()
      .from(organizations)
      .where(where)
      // id last, so pages don't overlap when updated_at ties.
      .orderBy(desc(organizations.updatedAt), asc(organizations.id))
      .offset((page - 1) * pageSize)
      // One extra row tells whether there's a next page.
      .limit(pageSize + 1),
    db
      .select({ country_code: organizations.countryCode, _count: count() })
      .from(organizations)
      .where(and(notDeleted, located, eq(organizations.type, type)))
      .groupBy(organizations.countryCode)
      .orderBy(desc(count())),
  ]);

  return {
    orgs: await computeAll(rows.slice(0, pageSize)),
    hasMore: rows.length > pageSize,
    countries,
  };
}

// Publishers (#331) aren't a type: an organisation of either type is one
// when it has the publisher role on a game that isn't deleted.
const publisherLinks = and(
  eq(gameOrganizations.role, 'publisher'),
  isNull(games.deletedAt)
);

// Every publisher's ID and how many games it published, with `tag` when
// given; a subquery to join organisations to.
const publishedCounts = (tag) =>
  db
    .select({
      organizationId: gameOrganizations.organizationId,
      publishedCount: count().as('published_count'),
    })
    .from(gameOrganizations)
    .innerJoin(games, eq(games.id, gameOrganizations.gameId))
    .where(
      and(
        publisherLinks,
        tag
          ? exists(
              db
                .select({ one: sql`1` })
                .from(gameTags)
                .innerJoin(tags, eq(tags.id, gameTags.tagId))
                .where(and(eq(gameTags.gameId, games.id), eq(tags.name, tag)))
            )
          : undefined
      )
    )
    .groupBy(gameOrganizations.organizationId)
    .as('published');

/**
 * One page of publishers (#331), those that published the most games
 * first, and the facets to narrow them: the countries they're in and the
 * tags of the games they published. `tag` keeps those that published a game
 * with it, counting only those games; `city` matches case-insensitively.
 *
 * @returns {Promise<{ orgs: object[], hasMore: boolean, countries: object[],
 *   tags: object[] }>} computed orgs (see models/org) with their
 *   `published_count`; countries as `{ country_code, _count }` and tags as
 *   `{ id, name, _count }` (publishers), most first
 */
export async function listPublishers({
  page = 1,
  pageSize = 50,
  country = null,
  city = null,
  tag = null,
} = {}) {
  const published = publishedCounts(tag);
  const all = publishedCounts(null);
  const publishersWithTag = sql`count(distinct ${gameOrganizations.organizationId})`.mapWith(Number);

  const [rows, countries, tagRows] = await Promise.all([
    db
      .select({ ...getTableColumns(organizations), publishedCount: published.publishedCount })
      .from(organizations)
      .innerJoin(published, eq(published.organizationId, organizations.id))
      .where(
        and(
          notDeleted,
          country ? eq(organizations.countryCode, country) : undefined,
          city ? sql`lower(${organizations.city}) = lower(${city})` : undefined
        )
      )
      // id last, so pages don't overlap when counts and names tie.
      .orderBy(desc(published.publishedCount), asc(organizations.name), asc(organizations.id))
      .offset((page - 1) * pageSize)
      // One extra row tells whether there's a next page.
      .limit(pageSize + 1),
    db
      .select({ country_code: organizations.countryCode, _count: count() })
      .from(organizations)
      .innerJoin(all, eq(all.organizationId, organizations.id))
      .where(and(notDeleted, located))
      .groupBy(organizations.countryCode)
      .orderBy(desc(count())),
    db
      .select({
        id: tags.id,
        name: tags.name,
        _count: publishersWithTag,
      })
      .from(gameTags)
      .innerJoin(tags, eq(tags.id, gameTags.tagId))
      .innerJoin(games, eq(games.id, gameTags.gameId))
      .innerJoin(gameOrganizations, eq(gameOrganizations.gameId, games.id))
      .innerJoin(organizations, eq(organizations.id, gameOrganizations.organizationId))
      .where(and(publisherLinks, notDeleted))
      .groupBy(tags.id)
      .orderBy(desc(publishersWithTag), asc(tags.name)),
  ]);

  const pageRows = rows.slice(0, pageSize);
  const orgs = await computeAll(pageRows);
  return {
    orgs: orgs.map((org, i) => ({ ...org, published_count: pageRows[i].publishedCount })),
    hasMore: rows.length > pageSize,
    countries,
    tags: tagRows,
  };
}

/** How many organisations have published a game (#331). */
export async function countPublishers() {
  const [{ value }] = await db
    .select({ value: sql`count(distinct ${gameOrganizations.organizationId})`.mapWith(Number) })
    .from(gameOrganizations)
    .innerJoin(games, eq(games.id, gameOrganizations.gameId))
    .innerJoin(organizations, eq(organizations.id, gameOrganizations.organizationId))
    .where(and(publisherLinks, notDeleted));
  return value;
}

/** The most recently updated organisations of either type (/orgs). */
export async function listRecentOrganizations({ limit }) {
  return computeAll(
    await db
      .select()
      .from(organizations)
      .where(notDeleted)
      .orderBy(desc(organizations.updatedAt))
      .limit(limit)
  );
}

/**
 * An organisation for its page: with its location, logo, games (newest
 * first, deleted ones left out) and hosted events (latest first), or null.
 */
export async function getOrganization(id) {
  const row = await db.query.organizations.findFirst({
    where: and(eq(organizations.id, id), notDeleted),
    with: {
      games: {
        with: {
          game: {
            with: {
              igdb: true,
              images: { orderBy: (t, { asc }) => [asc(t.position)] },
            },
          },
        },
      },
      events: {
        with: {
          event: {
            with: { games: { with: { game: true } }, participants: true },
          },
        },
      },
    },
  });
  if (!row) return null;

  const org = shape.organization(row);
  org.game_entity = row.games
    .filter(({ game }) => game && !game.deletedAt)
    .sort((a, b) => b.game.createdAt - a.game.createdAt)
    .map((link) => {
      const game = shape.game(link.game);
      game.igdb = shape.igdb(link.game.igdb);
      game.game_image = link.game.images.map(shape.gameImage);
      return {
        game_id: link.gameId,
        entity_id: link.organizationId,
        role: link.role,
        game,
      };
    });
  org.entity_event = row.events
    .filter(({ event }) => event && !event.deletedAt)
    .sort((a, b) => b.event.endsAt - a.event.endsAt)
    .map((link) => {
      const event = shape.event(link.event);
      event.game_event = link.event.games
        .filter(({ game }) => game && !game.deletedAt)
        .map(({ gameId, eventId }) => ({ game_id: gameId, event_id: eventId }));
      event.event_participant = link.event.participants.map(
        ({ eventId, personId }) => ({ event_id: eventId, person_id: personId })
      );
      return { entity_id: link.organizationId, event_id: link.eventId, event };
    });
  return computeOrg(org);
}

/**
 * An organisation for its edit form, or null: its fields, location, and
 * logo as `{ url, thumbnail_url }`.
 */
export async function getOrganizationForEdit(id) {
  const [row] = await db
    .select()
    .from(organizations)
    .where(and(eq(organizations.id, id), notDeleted));
  if (!row) return null;
  const org = shape.organization(row);
  return { ...org, logo: org.logo ? getImageLinks(org.logo) : null };
}

/**
 * Creates an organisation.
 * @param {{ name, type, site, bskyHandle, about, location, logoId, authorId }} fields
 *   `location` holds street, city, region, country_code, latitude,
 *   longitude; `logoId` is an upload's ID
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
  status,
  authorId = null,
}) {
  // #346: one record per website.
  await assertSiteIsFree('organization', site);
  const id = crypto.randomUUID();
  const slug = await freeSlug('organization', slugify(name));
  await recordChange({
    operation: 'create',
    kind: 'organization',
    recordId: id,
    authorId,
    statements: [
    db.insert(organizations).values({
      id,
      name,
      slug,
      type,
      status,
      site,
      bskyHandle,
      about,
      ...shape.locationColumns(location),
      ...(await imageColumns('logo', logoId)),
      searchText: shape.searchTextOf({ name, about }),
      lastModifiedById: authorId,
    }),
    ],
  });
  return { id, slug };
}

/**
 * Updates an organisation; a missing logo or empty location leaves the
 * current one.
 * @returns {Promise<{ id: string }>}
 */
export async function updateOrganization(
  id,
  { name, type, status, site, bskyHandle, about, location, logoId, authorId }
) {
  const [current] = await db
    .select({ slug: organizations.slug, site: organizations.site })
    .from(organizations)
    .where(eq(organizations.id, id));
  if (site && site !== current?.site) await assertSiteIsFree('organization', site, { excludeId: id });
  const slug = await freeSlug('organization', slugify(name), { recordId: id });
  await recordChange({
    operation: 'update',
    kind: 'organization',
    recordId: id,
    authorId,
    statements: [
    db
      .update(organizations)
      .set({
        name,
        lastModifiedById: authorId,
        type,
        status,
        site,
        bskyHandle,
        about,
        ...shape.locationColumns(location),
        ...(await imageColumns('logo', logoId)),
        searchText: shape.searchTextOf({ name, about }),
      })
      .where(eq(organizations.id, id)),
    ...renameSlugStatements('organization', id, current?.slug, slug),
    ],
  });
  return { id, slug };
}

/** Deletes an organisation: it's only hidden, and its history stays. */
export async function deleteOrganization(id, { authorId = null } = {}) {
  await recordChange({
    operation: 'delete',
    kind: 'organization',
    recordId: id,
    authorId,
    statements: [
    db
      .update(organizations)
      .set({ deletedAt: new Date() })
      .where(and(eq(organizations.id, id), notDeleted)),
    ],
  });
}

/**
 * Organisations matching `q` (see data/search), best first, for pickers:
 * `{ id, name }`, at most 10. Empty for an empty query.
 */
export async function searchOrganizations(q, { excludeIds = [] } = {}) {
  const found = await searchIndex(q, {
    kinds: ['studio', 'association'],
    excludeIds,
  });
  if (!found || found.hits.length === 0) return [];
  const ids = found.hits.map((hit) => hit.id);
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizations)
    .where(and(notDeleted, inArray(organizations.id, ids)));
  return inOrder(ids, rows);
}

/** Organisations as cards, computed, in the order of `ids` (search results). */
export async function listOrganizationCards(ids) {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(organizations)
    .where(and(notDeleted, inArray(organizations.id, ids)));
  return computeAll(inOrder(ids, rows));
}

/** Every organisation with a location, computed, for the map. */
export async function listMappedOrganizations() {
  return computeAll(
    await db.select().from(organizations).where(and(notDeleted, located))
  );
}

/** Where organisations are, as `[latitude, longitude]`, one per located org. */
export async function listOrganizationPoints() {
  const rows = await db
    .select({
      latitude: organizations.latitude,
      longitude: organizations.longitude,
    })
    .from(organizations)
    .where(and(notDeleted, located));
  return rows.map(({ latitude, longitude }) => [latitude, longitude]);
}

/** How many organisations there are, or of one `type`. */
export async function countOrganizations({ type } = {}) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(organizations)
    .where(and(notDeleted, type ? eq(organizations.type, type) : undefined));
  return value;
}

/**
 * A country's organisations for its page: `{ id, name, type, location:
 * { city, region, latitude, longitude } }`.
 */
export async function listOrganizationsIn(countryCode) {
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      type: organizations.type,
      city: organizations.city,
      region: organizations.region,
      latitude: organizations.latitude,
      longitude: organizations.longitude,
    })
    .from(organizations)
    .where(and(notDeleted, eq(organizations.countryCode, countryCode)));
  return rows.map(({ city, region, latitude, longitude, ...org }) => ({
    ...org,
    location: { city, region, latitude, longitude },
  }));
}

/**
 * Studios or associations worth featuring (#199): complete ones, with a
 * logo, a description and a place, most recently updated first, computed.
 */
export async function listFeaturedOrganizations({ type, limit }) {
  return computeAll(
    await db
      .select()
      .from(organizations)
      .where(
        and(
          notDeleted,
          eq(organizations.type, type),
          isNotNull(organizations.logoKey),
          sql`trim(coalesce(${organizations.about}, '')) <> ''`,
          located
        )
      )
      .orderBy(desc(organizations.updatedAt), asc(organizations.id))
      .limit(limit)
  );
}
