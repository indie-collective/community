// The change log (#151): what history pages and the admin pages read, and
// the rows the other data modules write with each change. The Postgres
// triggers that wrote it are gone (ADR 0003): `logChange` goes in the same
// D1 batch as the change it records.
import { and, desc, eq, lt, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { changes, events, games, organizations } from '../db/schema.js';
import computeEvent from '../models/event';
import computeGame from '../models/game';
import computeOrg from '../models/org';
import * as shape from './shapes.server';

// Each kind of record: its table, its name in the change log and in the
// old shapes routes read, how its page computes it, and what a change
// records about it (with the old field names, which revision pages diff).
const location = (t) =>
  sql`'country_code', ${t.countryCode}, 'region', ${t.region}, 'city', ${t.city}, 'street', ${t.street}, 'latitude', ${t.latitude}, 'longitude', ${t.longitude}`;
const KINDS = {
  game: {
    table: games,
    name: 'games',
    legacyName: 'game',
    toShape: shape.game,
    compute: computeGame,
    data: sql`json_object('id', ${games.id}, 'name', ${games.name}, 'about', ${games.about}, 'site', ${games.site}, 'igdb_slug', ${games.igdbSlug}, 'deleted', json(iif(${games.deletedAt} is null, 'false', 'true')), 'created_at', ${games.createdAt}, 'updated_at', ${games.updatedAt})`,
  },
  organization: {
    table: organizations,
    name: 'organizations',
    legacyName: 'entity',
    toShape: shape.organization,
    compute: computeOrg,
    data: sql`json_object('id', ${organizations.id}, 'type', ${organizations.type}, 'status', ${organizations.status}, 'name', ${organizations.name}, 'about', ${organizations.about}, 'site', ${organizations.site}, 'bsky_handle', ${organizations.bskyHandle}, ${location(organizations)}, 'created_at', ${organizations.createdAt}, 'updated_at', ${organizations.updatedAt})`,
  },
  event: {
    table: events,
    name: 'events',
    legacyName: 'event',
    toShape: shape.event,
    compute: computeEvent,
    data: sql`json_object('id', ${events.id}, 'name', ${events.name}, 'about', ${events.about}, 'site', ${events.site}, 'starts_at', ${events.startsAt}, 'ends_at', ${events.endsAt}, 'time_zone', ${events.timeZone}, 'status', ${events.status}, ${location(events)}, 'created_at', ${events.createdAt}, 'updated_at', ${events.updatedAt})`,
  },
};
const LEGACY_NAMES = Object.fromEntries(
  Object.values(KINDS).map(({ name, legacyName }) => [name, legacyName])
);

/**
 * The change-log row for a create, update or delete of a record, as a
 * statement for the same `db.batch` as the change, after it: it records
 * the record as it then is.
 */
export function logChange(operation, kind, recordId, authorId = null) {
  const { table, name, data } = KINDS[kind];
  return db.insert(changes).select(
    db
      .select({
        id: sql`${crypto.randomUUID()}`.as('id'),
        operation: sql`${operation}`.as('operation'),
        tableName: sql`${name}`.as('table_name'),
        recordId: table.id,
        data: data.as('data'),
        authorId: sql`${authorId}`.as('author_id'),
        createdAt: sql`${Date.now()}`.as('created_at'),
      })
      .from(table)
      .where(eq(table.id, recordId))
  );
}

const withLegacyTable = (change) => ({
  ...change,
  table_name: LEGACY_NAMES[change.tableName] ?? change.tableName,
});

/**
 * The latest changes to games, organisations and events, newest first,
 * with their author's id, names and admin flag.
 */
export async function listRecentChanges({ limit }) {
  const rows = await db.query.changes.findMany({
    orderBy: desc(changes.createdAt),
    limit,
    with: { author: true },
  });
  return rows.map((row) => {
    const author = shape.person(row.author);
    return {
      id: row.id,
      operation: row.operation,
      created_at: row.createdAt,
      table_name: withLegacyTable(row).table_name,
      record_id: row.recordId,
      data: row.data,
      author: author && {
        id: author.id,
        first_name: author.first_name,
        last_name: author.last_name,
        isAdmin: author.isAdmin,
      },
    };
  });
}

/**
 * The record a history page is about (`kind` is "game", "organization" or
 * "event"), computed as on its own page; or null, also once deleted.
 */
export async function getHistorySubject(kind, id) {
  const { table, toShape, compute } = KINDS[kind];
  const [row] = await db
    .select()
    .from(table)
    .where(and(eq(table.id, id), sql`${table.deletedAt} is null`));
  return row ? compute(toShape(row)) : null;
}

/**
 * A record's changes, newest first: `{ id, operation, created_at, author:
 * { username } }`.
 */
export async function listChanges(kind, recordId) {
  const rows = await db.query.changes.findMany({
    where: and(
      eq(changes.recordId, recordId),
      eq(changes.tableName, KINDS[kind].name)
    ),
    orderBy: desc(changes.createdAt),
    with: { author: { columns: { username: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    operation: row.operation,
    author: row.author,
    created_at: row.createdAt,
  }));
}

/** The ID of a record's latest change, or undefined. */
export async function getLatestChangeId(kind, recordId) {
  const [row] = await db
    .select({ id: changes.id })
    .from(changes)
    .where(
      and(
        eq(changes.recordId, recordId),
        eq(changes.tableName, KINDS[kind].name)
      )
    )
    .orderBy(desc(changes.createdAt))
    .limit(1);
  return row?.id;
}

/**
 * A change and the one before it to the same record, for a diff; or null.
 * The change: `{ id, operation, data, record_id, created_at, author: { id,
 * username } }`; the previous one: `{ id, data, created_at }` or null.
 */
export async function getRevision(kind, id) {
  const row = await db.query.changes.findFirst({
    where: eq(changes.id, id),
    with: { author: { columns: { id: true, username: true } } },
  });
  if (!row) return null;
  const [previous] = await db
    .select({
      id: changes.id,
      data: changes.data,
      created_at: changes.createdAt,
    })
    .from(changes)
    .where(
      and(
        eq(changes.recordId, row.recordId),
        eq(changes.tableName, KINDS[kind].name),
        lt(changes.createdAt, row.createdAt)
      )
    )
    .orderBy(desc(changes.createdAt))
    .limit(1);
  return {
    revision: {
      operation: row.operation,
      id: row.id,
      data: row.data,
      record_id: row.recordId,
      created_at: row.createdAt,
      author: row.author,
    },
    previous: previous ?? null,
  };
}
