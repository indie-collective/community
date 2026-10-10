// The change log (#151, part 2): what history pages and the admin pages
// read. The only place that knows how changes are stored.
import { db } from '../utils/db.server';
import computeEvent from '../models/event';
import computeGame from '../models/game';
import computeOrg from '../models/org';

// What each kind of record is called in the change log, where it's stored,
// and how its page computes it.
const KINDS = {
  game: {
    table: 'game',
    find: (id) => db.game.findUnique({ where: { id } }),
    compute: computeGame,
  },
  organization: {
    table: 'entity',
    find: (id) => db.entity.findUnique({ where: { id } }),
    compute: computeOrg,
  },
  event: {
    table: 'event',
    find: (id) => db.event.findUnique({ where: { id } }),
    compute: computeEvent,
  },
};

/**
 * The latest changes to games, organisations and events, newest first,
 * with their author's id, names and admin flag.
 */
export function listRecentChanges({ limit }) {
  return db.change.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      operation: true,
      created_at: true,
      table_name: true,
      record_id: true,
      data: true,
      author: {
        select: { id: true, first_name: true, last_name: true, isAdmin: true },
      },
    },
  });
}

/**
 * The record a history page is about (`kind` is "game", "organization" or
 * "event"), computed as on its own page; or null.
 */
export async function getHistorySubject(kind, id) {
  const { find, compute } = KINDS[kind];
  const record = await find(id);
  return record ? compute(record) : null;
}

/**
 * A record's changes, newest first: `{ id, operation, created_at, author:
 * { username } }`.
 */
export function listChanges(kind, recordId) {
  return db.change.findMany({
    where: { record_id: recordId, table_name: KINDS[kind].table },
    select: {
      id: true,
      operation: true,
      author: { select: { username: true } },
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

/** The ID of a record's latest change, or undefined. */
export async function getLatestChangeId(kind, recordId) {
  return (
    await db.change.findFirst({
      where: { record_id: recordId, table_name: KINDS[kind].table },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    })
  )?.id;
}

/**
 * A change and the one before it to the same record, for a diff; or null.
 * The change: `{ id, operation, data, record_id, created_at, author: { id,
 * username } }`; the previous one: `{ id, data, created_at }` or null.
 */
export async function getRevision(kind, id) {
  const revision = await db.change.findUnique({
    where: { id },
    select: {
      operation: true,
      id: true,
      data: true,
      record_id: true,
      created_at: true,
      author: { select: { id: true, username: true } },
    },
  });
  if (!revision) return null;
  const previous = await db.change.findFirst({
    where: {
      record_id: revision.record_id,
      table_name: KINDS[kind].table,
      created_at: { lt: revision.created_at },
    },
    select: { id: true, data: true, created_at: true },
    orderBy: { created_at: 'desc' },
  });
  return { revision, previous };
}
