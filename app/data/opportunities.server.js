// Opportunities (#345): jobs, playtests, pitches… that organisations,
// games and events post, until their end date.
import { and, asc, eq, exists, gte, isNull, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, opportunities, organizations } from '../db/schema.js';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import { recordChange } from './changes.server';
import { findBySlugOrId } from './slugs.server';

const current = (now = new Date()) => and(isNull(opportunities.deletedAt), gte(opportunities.endsAt, now));

// An opportunity row with what it's for, as pages show it.
const shape = (row) => ({
  id: row.opportunity.id,
  kind: row.opportunity.kind,
  title: row.opportunity.title,
  about: row.opportunity.about,
  link: row.opportunity.link,
  remote: row.opportunity.remote,
  city: row.opportunity.city,
  country_code: row.opportunity.countryCode,
  ends_at: row.opportunity.endsAt,
  author_id: row.opportunity.authorId,
  created_at: row.opportunity.createdAt,
  for:
    row.organization?.id && !row.organization.deletedAt
      ? { kind: 'organization', name: row.organization.name, path: orgPath(row.organization) }
      : row.game?.id && !row.game.deletedAt
        ? { kind: 'game', name: row.game.name, path: gamePath(row.game) }
        : row.event?.id && !row.event.deletedAt
          ? { kind: 'event', name: row.event.name, path: eventPath(row.event) }
          : null,
});

const withRecords = () =>
  db
    .select({
      opportunity: opportunities,
      organization: { id: organizations.id, slug: organizations.slug, name: organizations.name, deletedAt: organizations.deletedAt },
      game: { id: games.id, slug: games.slug, name: games.name, deletedAt: games.deletedAt },
      event: { id: events.id, slug: events.slug, name: events.name, deletedAt: events.deletedAt },
    })
    .from(opportunities)
    .leftJoin(organizations, eq(organizations.id, opportunities.organizationId))
    .leftJoin(games, eq(games.id, opportunities.gameId))
    .leftJoin(events, eq(events.id, opportunities.eventId));

/**
 * Current opportunities, ending soonest first: of a `kind`, in a `country`
 * (or remote), remote only, or for one organisation, game or event.
 */
export async function listOpportunities({ kind, country, remote, organizationId, gameId, eventId } = {}) {
  const rows = await withRecords()
    .where(
      and(
        current(),
        kind ? eq(opportunities.kind, kind) : undefined,
        country ? eq(opportunities.countryCode, country) : undefined,
        remote ? eq(opportunities.remote, true) : undefined,
        organizationId ? eq(opportunities.organizationId, organizationId) : undefined,
        gameId ? eq(opportunities.gameId, gameId) : undefined,
        eventId ? eq(opportunities.eventId, eventId) : undefined
      )
    )
    .orderBy(asc(opportunities.endsAt))
    .limit(500);
  // Not those of deleted records.
  return rows.map(shape).filter((opportunity) => opportunity.for);
}

/** Countries with current opportunities, for the filter: `{ country_code, _count }`. */
export async function listOpportunityCountries() {
  return db
    .select({ country_code: opportunities.countryCode, _count: sql`count(*)`.mapWith(Number) })
    .from(opportunities)
    .where(and(current(), sql`${opportunities.countryCode} is not null`))
    .groupBy(opportunities.countryCode);
}

/** One opportunity, current or not, or undefined. */
export async function getOpportunity(id) {
  const [row] = await withRecords().where(and(eq(opportunities.id, id), isNull(opportunities.deletedAt)));
  return row && shape(row);
}

/** Whether an organisation is taking pitches now: for the publishers list. */
export const openToPitches = (organizationId) =>
  exists(
    db
      .select({ one: sql`1` })
      .from(opportunities)
      .where(and(current(), eq(opportunities.kind, 'pitches'), eq(opportunities.organizationId, organizationId)))
  );

/**
 * Posts an opportunity for an organisation, game or event (`for`: `{ kind,
 * id }`), as a change in the log.
 */
export async function createOpportunity(fields, { for: target, authorId }) {
  const id = crypto.randomUUID();
  await recordChange({
    operation: 'create',
    kind: 'opportunity',
    recordId: id,
    authorId,
    statements: [
      db.insert(opportunities).values({
        id,
        ...fields,
        organizationId: target.kind === 'organization' ? target.id : null,
        gameId: target.kind === 'game' ? target.id : null,
        eventId: target.kind === 'event' ? target.id : null,
        authorId,
        lastModifiedById: authorId,
      }),
    ],
  });
  return { id };
}

/** Takes an opportunity down, as a change in the log. */
export async function deleteOpportunity(id, { authorId }) {
  await recordChange({
    operation: 'delete',
    kind: 'opportunity',
    recordId: id,
    authorId,
    statements: [
      db
        .update(opportunities)
        .set({ deletedAt: new Date(), lastModifiedById: authorId })
        .where(and(eq(opportunities.id, id), isNull(opportunities.deletedAt))),
    ],
  });
}

const TARGETS = {
  organization: { table: organizations, path: orgPath },
  game: { table: games, path: gamePath },
  event: { table: events, path: eventPath },
};

/**
 * What an opportunity is being posted for: an organisation, game or event
 * of `kind` by slug or ID, as `{ kind, id, name, path, countryCode }`; or
 * null when there's none.
 */
export async function getOpportunityTarget(kind, value) {
  const target = TARGETS[kind];
  const found = target && value && (await findBySlugOrId(kind, value));
  if (!found) return null;
  const [record] = await db.select().from(target.table).where(eq(target.table.id, found.id));
  if (!record || record.deletedAt) return null;
  return { kind, id: record.id, name: record.name, path: target.path(record), countryCode: record.countryCode ?? null };
}
