// The public read-only API (#349): games, organisations and events in
// stable shapes, apart from what pages load, with links between them. No
// people, no private fields, no deleted records.
import { and, asc, desc, eq, exists, gt, gte, inArray, isNull, lt, or, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  events,
  gameEvents,
  gameMilestones,
  gameOrganizations,
  games,
  gameTags,
  organizationEvents,
  organizations,
  tags,
} from '../db/schema.js';
import getImageLinks from '../utils/imageLinks.server';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import { madeIn } from './games.server';
import { image } from './shapes.server';
import { findBySlugOrId } from './slugs.server';

export const MAX_LIMIT = 100;

const iso = (date) => (date ? new Date(date).toISOString() : null);
const absolute = (url, origin) => (url ? new URL(url, origin).href : null);
const imageUrl = (key, origin) => (key ? absolute(getImageLinks(image(key)).url, origin) : null);

// A cursor: where the next page starts, as an opaque string.
const encodeCursor = (value, id) => btoa(JSON.stringify([value, id])).replace(/=+$/, '');
function decodeCursor(cursor) {
  try {
    const [value, id] = JSON.parse(atob(cursor));
    return typeof id === 'string' ? { value, id } : null;
  } catch {
    return null;
  }
}

// After the cursor, in an order on `column` then id.
const after = (cursor, column, idColumn, direction) => {
  if (!cursor) return undefined;
  const value = column.columnType === 'SQLiteTimestamp' ? new Date(cursor.value) : cursor.value;
  const beyond = direction === 'asc' ? gt : lt;
  return or(beyond(column, value), and(eq(column, value), beyond(idColumn, cursor.id)));
};

// One page of `rows` (one extra asks for the next), with its cursor.
const page = (rows, limit, valueOf) => {
  const shown = rows.slice(0, limit);
  const last = shown.at(-1);
  return { shown, next: rows.length > limit && last ? encodeCursor(valueOf(last), last.id) : null };
};

// ---------------------------------------------------------------------------
// Shapes

const placeOf = (row) =>
  row.countryCode || row.city
    ? {
        country_code: row.countryCode,
        region: row.region,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
      }
    : null;

const organizationShape = (row, origin) => ({
  id: row.id,
  slug: row.slug,
  url: `${origin}${orgPath(row)}`,
  type: row.type,
  status: row.status,
  name: row.name,
  about: row.about,
  site: row.site,
  bsky_handle: row.bskyHandle,
  place: placeOf(row),
  logo_url: imageUrl(row.logoKey, origin),
  created_at: iso(row.createdAt),
  updated_at: iso(row.updatedAt),
});

const eventShape = (row, origin) => ({
  id: row.id,
  slug: row.slug,
  url: `${origin}${eventPath(row)}`,
  name: row.name,
  about: row.about,
  site: row.site,
  ticket_url: row.ticketUrl,
  starts_at: iso(row.startsAt),
  ends_at: iso(row.endsAt),
  time_zone: row.timeZone,
  status: row.status,
  attendance: row.attendance,
  online_url: row.onlineUrl,
  place: placeOf(row) && { ...placeOf(row), street: row.street },
  cover_url: imageUrl(row.coverKey, origin),
  previous_edition_id: row.previousEditionId,
  created_at: iso(row.createdAt),
  updated_at: iso(row.updatedAt),
});

const gameShape = (row, origin, { images = [] } = {}) => ({
  id: row.id,
  slug: row.slug,
  url: `${origin}${gamePath(row)}`,
  name: row.name,
  about: row.about,
  site: row.site,
  igdb_slug: row.igdbSlug,
  image_urls: images.map((key) => imageUrl(key, origin)),
  created_at: iso(row.createdAt),
  updated_at: iso(row.updatedAt),
});

const brief = (row, origin, path) => ({ id: row.id, name: row.name, url: `${origin}${path(row)}` });

// ---------------------------------------------------------------------------
// Lists

/**
 * A page of games, newest first: made in `country`, tagged `tag`.
 * @returns {Promise<{ data: object[], next: string | null }>}
 */
export async function listApiGames({ origin, country, tag, limit, cursor }) {
  const rows = await db
    .select()
    .from(games)
    .where(
      and(
        isNull(games.deletedAt),
        country ? madeIn(country) : undefined,
        tag
          ? exists(
              db
                .select({ one: sql`1` })
                .from(gameTags)
                .innerJoin(tags, eq(tags.id, gameTags.tagId))
                .where(and(eq(gameTags.gameId, games.id), eq(tags.name, tag)))
            )
          : undefined,
        after(decodeCursor(cursor), games.createdAt, games.id, 'desc')
      )
    )
    .orderBy(desc(games.createdAt), desc(games.id))
    .limit(limit + 1);
  const { shown, next } = page(rows, limit, (row) => row.createdAt.getTime());
  return { data: shown.map((row) => gameShape(row, origin)), next };
}

/** A page of organisations, newest first: of a `type`, in a `country` or `city`. */
export async function listApiOrganizations({ origin, type, country, city, limit, cursor }) {
  const rows = await db
    .select()
    .from(organizations)
    .where(
      and(
        isNull(organizations.deletedAt),
        type ? eq(organizations.type, type) : undefined,
        country ? eq(organizations.countryCode, country) : undefined,
        city ? sql`lower(${organizations.city}) = lower(${city})` : undefined,
        after(decodeCursor(cursor), organizations.createdAt, organizations.id, 'desc')
      )
    )
    .orderBy(desc(organizations.createdAt), desc(organizations.id))
    .limit(limit + 1);
  const { shown, next } = page(rows, limit, (row) => row.createdAt.getTime());
  return { data: shown.map((row) => organizationShape(row, origin)), next };
}

/**
 * A page of events: upcoming ones soonest first (the default), or past ones
 * latest first; in a `country`, or hosted by `organization` (an ID).
 */
export async function listApiEvents({ origin, country, organization, upcoming = true, limit, cursor }) {
  const now = new Date();
  const direction = upcoming ? 'asc' : 'desc';
  const order = upcoming ? asc : desc;
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        isNull(events.deletedAt),
        upcoming ? gte(events.endsAt, now) : lt(events.endsAt, now),
        country ? eq(events.countryCode, country) : undefined,
        organization
          ? exists(
              db
                .select({ one: sql`1` })
                .from(organizationEvents)
                .where(and(eq(organizationEvents.eventId, events.id), eq(organizationEvents.organizationId, organization)))
            )
          : undefined,
        after(decodeCursor(cursor), events.startsAt, events.id, direction)
      )
    )
    .orderBy(order(events.startsAt), order(events.id))
    .limit(limit + 1);
  const { shown, next } = page(rows, limit, (row) => row.startsAt.getTime());
  return { data: shown.map((row) => eventShape(row, origin)), next };
}

// ---------------------------------------------------------------------------
// One record, with its links

const findLive = async (kind, table, idOrSlug) => {
  const found = await findBySlugOrId(kind, idOrSlug);
  if (!found) return null;
  const [row] = await db.select().from(table).where(and(eq(table.id, found.id), isNull(table.deletedAt)));
  return row ?? null;
};

/** A game by ID or slug, with its organisations and roles, tags, events and timeline; or null. */
export async function getApiGame(idOrSlug, { origin }) {
  const row = await findLive('game', games, idOrSlug);
  if (!row) return null;
  const [credits, tagRows, eventRows, steps, imageRows] = await Promise.all([
    db
      .select({ organization: organizations, role: gameOrganizations.role })
      .from(gameOrganizations)
      .innerJoin(organizations, eq(organizations.id, gameOrganizations.organizationId))
      .where(and(eq(gameOrganizations.gameId, row.id), isNull(organizations.deletedAt))),
    db.select({ name: tags.name }).from(gameTags).innerJoin(tags, eq(tags.id, gameTags.tagId)).where(eq(gameTags.gameId, row.id)),
    db
      .select({ event: events })
      .from(gameEvents)
      .innerJoin(events, eq(events.id, gameEvents.eventId))
      .where(and(eq(gameEvents.gameId, row.id), isNull(events.deletedAt))),
    db.select().from(gameMilestones).where(eq(gameMilestones.gameId, row.id)).orderBy(asc(gameMilestones.date)),
    db.query.gameImages.findMany({ where: (t, { eq: is }) => is(t.gameId, row.id), orderBy: (t, { asc: up }) => [up(t.position)] }),
  ]);
  return {
    ...gameShape(row, origin, { images: imageRows.map((img) => img.key) }),
    organizations: credits.map(({ organization, role }) => ({ ...brief(organization, origin, orgPath), role })),
    tags: tagRows.map((tag) => tag.name),
    events: eventRows.map(({ event }) => ({ ...brief(event, origin, eventPath), starts_at: iso(event.startsAt) })),
    milestones: steps.map((step) => ({
      kind: step.kind,
      date: iso(step.date).slice(0, 10),
      date_precision: step.datePrecision,
      note: step.note,
    })),
  };
}

/** An organisation by ID or slug, with its games (and roles) and hosted events; or null. */
export async function getApiOrganization(idOrSlug, { origin }) {
  const row = await findLive('organization', organizations, idOrSlug);
  if (!row) return null;
  const [credits, hosted] = await Promise.all([
    db
      .select({ game: games, role: gameOrganizations.role })
      .from(gameOrganizations)
      .innerJoin(games, eq(games.id, gameOrganizations.gameId))
      .where(and(eq(gameOrganizations.organizationId, row.id), isNull(games.deletedAt))),
    db
      .select({ event: events })
      .from(organizationEvents)
      .innerJoin(events, eq(events.id, organizationEvents.eventId))
      .where(and(eq(organizationEvents.organizationId, row.id), isNull(events.deletedAt)))
      .orderBy(desc(events.startsAt)),
  ]);
  return {
    ...organizationShape(row, origin),
    games: credits.map(({ game, role }) => ({ ...brief(game, origin, gamePath), role })),
    events: hosted.map(({ event }) => ({ ...brief(event, origin, eventPath), starts_at: iso(event.startsAt) })),
  };
}

/** An event by ID or slug, with its hosts and games; or null. */
export async function getApiEvent(idOrSlug, { origin }) {
  const row = await findLive('event', events, idOrSlug);
  if (!row) return null;
  const [hosts, shown] = await Promise.all([
    db
      .select({ organization: organizations })
      .from(organizationEvents)
      .innerJoin(organizations, eq(organizations.id, organizationEvents.organizationId))
      .where(and(eq(organizationEvents.eventId, row.id), isNull(organizations.deletedAt))),
    db
      .select({ game: games })
      .from(gameEvents)
      .innerJoin(games, eq(games.id, gameEvents.gameId))
      .where(and(eq(gameEvents.eventId, row.id), isNull(games.deletedAt))),
  ]);
  return {
    ...eventShape(row, origin),
    organizations: hosts.map(({ organization }) => brief(organization, origin, orgPath)),
    games: shown.map(({ game }) => brief(game, origin, gamePath)),
  };
}

/** Games an organisation made or published, for its widget: `{ name, url, image_url }`. */
export async function listOrganizationGamesForWidget(organizationId, { origin, limit = 12 }) {
  const rows = await db
    .select({ game: games })
    .from(gameOrganizations)
    .innerJoin(games, eq(games.id, gameOrganizations.gameId))
    .where(and(eq(gameOrganizations.organizationId, organizationId), isNull(games.deletedAt)))
    .orderBy(desc(games.createdAt))
    .limit(limit * 2);
  const unique = [...new Map(rows.map(({ game }) => [game.id, game])).values()].slice(0, limit);
  const firstImages = unique.length
    ? await db.query.gameImages.findMany({ where: (t) => inArray(t.gameId, unique.map((g) => g.id)), orderBy: (t, { asc: up }) => [up(t.position)] })
    : [];
  return unique.map((game) => ({
    name: game.name,
    url: `${origin}${gamePath(game)}`,
    image_url: imageUrl(firstImages.find((img) => img.gameId === game.id)?.key, origin),
  }));
}
