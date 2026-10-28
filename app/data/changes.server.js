// The change log (#151, #309, #340): one row per create, update or delete of
// a game, organisation or event, so admins can see who changed what and
// undo it. Written by the app with the change (ADR 0003).
//
// A row records the record's state *before* the change (after it, for a
// create), from every column of its table and its links (studios and
// roles, tags, events, images, timeline), in the same D1 batch as the
// change. Once written, the row keeps only the fields that changed, before
// and after: `{ v: 2, before, after }`. A save that changed nothing leaves
// no row. Rows from before (#151) hold the whole record after the change,
// without `v`.
import { and, count, desc, eq, gt, gte, inArray, lt, ne, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  changes,
  events,
  gameEvents,
  gameImages,
  gameMilestones,
  gameOrganizations,
  games,
  gameTags,
  organizationEvents,
  organizations,
  people,
} from '../db/schema.js';
import { inBackground } from '../utils/background.server';
import { changedFields, recordedColumns } from '../utils/changeLog';
import { toOrigin } from '../utils/origin.server';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import * as shape from './shapes.server';

// A record's links, as JSON in its snapshot, in a stable order so equal
// links compare equal. Explicit table names: subqueries refer to the outer row.
const list = (key, select, from, order) =>
  sql.raw(`'${key}', json((select json_group_array(${select}) from (select * from ${from} order by ${order})))`);

const KINDS = {
  game: {
    table: games,
    name: 'games',
    path: gamePath,
    label: 'game',
    links: [
      list('tag_ids', 'tag_id', 'game_tags where game_tags.game_id = "games"."id"', 'tag_id'),
      list(
        'organizations',
        "json_object('organization_id', organization_id, 'role', role)",
        'game_organizations where game_organizations.game_id = "games"."id"',
        'organization_id, role'
      ),
      list('event_ids', 'event_id', 'game_events where game_events.game_id = "games"."id"', 'event_id'),
      list(
        'images',
        "json_object('key', key, 'width', width, 'height', height, 'position', position)",
        'game_images where game_images.game_id = "games"."id"',
        'position, key'
      ),
      list(
        'milestones',
        "json_object('kind', kind, 'date', date, 'date_precision', date_precision, 'note', note)",
        'game_milestones where game_milestones.game_id = "games"."id"',
        'date, kind'
      ),
    ],
  },
  organization: {
    table: organizations,
    name: 'organizations',
    path: orgPath,
    label: 'organisation',
    links: [
      list(
        'event_ids',
        'event_id',
        'organization_events where organization_events.organization_id = "organizations"."id"',
        'event_id'
      ),
    ],
  },
  event: {
    table: events,
    name: 'events',
    path: eventPath,
    label: 'event',
    links: [
      list('game_ids', 'game_id', 'game_events where game_events.event_id = "events"."id"', 'game_id'),
      list(
        'organization_ids',
        'organization_id',
        'organization_events where organization_events.event_id = "events"."id"',
        'organization_id'
      ),
    ],
  },
};
const KIND_OF_TABLE = Object.fromEntries(Object.entries(KINDS).map(([kind, { name }]) => [name, kind]));

/** The SQL for a record's snapshot: its recorded columns and links, as JSON. */
export function snapshotSql(kind) {
  const { table, links } = KINDS[kind];
  const columns = recordedColumns(table).map(([, column]) => sql`${sql.raw(`'${column.name}'`)}, ${column}`);
  return sql`json_object(${sql.join([...columns, ...links], sql`, `)})`;
}

/** A record's snapshot now, or undefined when it doesn't exist. */
export async function snapshot(kind, recordId) {
  const { table } = KINDS[kind];
  const [row] = await db
    .select({ data: snapshotSql(kind).mapWith((value) => JSON.parse(value)) })
    .from(table)
    .where(eq(table.id, recordId));
  return row?.data;
}

// The pending row, written in the batch: the snapshot under `key`.
const insertChange = ({ id, operation, kind, recordId, authorId, key }) => {
  const { table, name } = KINDS[kind];
  return db.insert(changes).select(
    db
      .select({
        id: sql`${id}`.as('id'),
        operation: sql`${operation}`.as('operation'),
        tableName: sql`${name}`.as('table_name'),
        recordId: table.id,
        data: sql`json_object('v', 2, ${sql.raw(`'${key}'`)}, ${snapshotSql(kind)})`.as('data'),
        authorId: sql`${authorId}`.as('author_id'),
        createdAt: sql`${Date.now()}`.as('created_at'),
      })
      .from(table)
      .where(eq(table.id, recordId))
  );
};

// ---------------------------------------------------------------------------
// Stopping vandals before they write (#309)

/** How many changes a member can make in an hour; admins have no limit. */
export const editsPerHour = () => Number(process.env.EDITS_PER_HOUR) || 15;

const HOUR = 3600000;

async function checkRateLimit(authorId) {
  if (!authorId) return;
  const [person] = await db
    .select({ role: people.role, username: people.username })
    .from(people)
    .where(eq(people.id, authorId));
  if (!person || person.role === 'admin') return;
  const [{ value }] = await db
    .select({ value: count() })
    .from(changes)
    .where(and(eq(changes.authorId, authorId), gt(changes.createdAt, new Date(Date.now() - HOUR))));
  if (value < editsPerHour()) return;
  // One alert for the first refusal in a run of them.
  if (value === editsPerHour()) {
    alertModerators(`🛑 @${person.username} reached ${editsPerHour()} changes in an hour; their next ones are refused.`, {
      username: person.username,
    });
  }
  throw new Response(
    `You've made ${editsPerHour()} changes in the last hour. Please wait a little before making more.`,
    { status: 429, statusText: 'Too Many Requests' }
  );
}

// ---------------------------------------------------------------------------
// Noticing (#309): every change goes to the moderators' Discord channel.

function alertModerators(content, { username } = {}) {
  const webhook = process.env.DISCORD_MODERATION_WEBHOOK;
  if (!webhook) {
    console.warn('DISCORD_MODERATION_WEBHOOK is not configured');
    return;
  }
  const base = toOrigin(process.env.BASE_URL) ?? '';
  const moderation = `${base}/admin/changes${username ? `?person=${encodeURIComponent(username)}` : ''}`;
  inBackground(() =>
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Names come from people: never let them ping anyone.
      body: JSON.stringify({ content: `${content}\nModerate: ${moderation}`, allowed_mentions: { parse: [] } }),
    })
  );
}

const VERBS = { create: 'added', update: 'changed', delete: 'deleted' };

async function announce({ operation, kind, recordId, authorId, fields, undoOf }) {
  const [author] = authorId
    ? await db.select({ username: people.username }).from(people).where(eq(people.id, authorId))
    : [];
  const { table, path, label } = KINDS[kind];
  const [record] = await db.select({ id: table.id, slug: table.slug, name: table.name }).from(table).where(eq(table.id, recordId));
  const base = toOrigin(process.env.BASE_URL) ?? '';
  const who = author ? `@${author.username}` : 'Someone';
  const what = undoOf ? 'undid a change to' : VERBS[operation];
  const detail = fields?.length ? ` (${fields.join(', ')})` : '';
  alertModerators(`${who} ${what} the ${label} “${record?.name ?? recordId}”${detail}: ${base}${path(record ?? { id: recordId })}`, {
    username: author?.username,
  });
}

// ---------------------------------------------------------------------------
// Writing changes

/**
 * Makes a change and records it: `statements` (a D1 batch's) change the
 * record of `kind` with ID `recordId` (for a create, they insert it). Refuses
 * with a 429 Response over a member's hourly limit.
 *
 * @returns {Promise<{ id: string, fields: string[] } | null>} the change, or
 *   null when nothing changed (no row is kept)
 */
export async function recordChange({ operation, kind, recordId, authorId = null, statements, undoOf = null }) {
  await checkRateLimit(authorId);
  const id = crypto.randomUUID();
  const creating = operation === 'create';
  const pending = { id, operation, kind, recordId, authorId, key: creating ? 'after' : 'before' };
  await db.batch([
    ...(creating ? [] : [insertChange(pending)]),
    ...statements,
    ...(creating ? [insertChange(pending)] : []),
  ]);

  const [row] = await db.select({ data: changes.data }).from(changes).where(eq(changes.id, id));
  if (!row) return null;
  let fields;
  if (creating) {
    fields = [];
    if (undoOf) await db.update(changes).set({ data: { ...row.data, undo_of: undoOf } }).where(eq(changes.id, id));
  } else {
    const { before, after } = changedFields(row.data.before, await snapshot(kind, recordId));
    fields = Object.keys(before);
    if (fields.length === 0) {
      await db.delete(changes).where(eq(changes.id, id));
      return null;
    }
    await db
      .update(changes)
      .set({ data: { v: 2, before, after, ...(undoOf ? { undo_of: undoOf } : {}) } })
      .where(eq(changes.id, id));
  }
  await announce({ operation, kind, recordId, authorId, fields, undoOf });
  return { id, fields };
}

// ---------------------------------------------------------------------------
// Undoing (#309)

const COLUMN_BY_NAME = (table) =>
  Object.fromEntries(recordedColumns(table).map(([key, column]) => [column.name, { key, column }]));

// A snapshot's column value as Drizzle writes it (dates as Dates).
const toValue = (column, value) =>
  value == null ? null : column.columnType === 'SQLiteTimestamp' ? new Date(value) : value;

// Statements that put a record's links back as `before` has them.
function linkStatements(kind, recordId, before) {
  const statements = [];
  const replace = (key, table, where, rows) => {
    if (!(key in before)) return;
    statements.push(db.delete(table).where(where));
    if (rows.length > 0) statements.push(db.insert(table).values(rows).onConflictDoNothing());
  };
  const items = (key) => before[key] ?? [];
  if (kind === 'game') {
    replace('tag_ids', gameTags, eq(gameTags.gameId, recordId), items('tag_ids').map((tagId) => ({ gameId: recordId, tagId })));
    replace(
      'organizations',
      gameOrganizations,
      eq(gameOrganizations.gameId, recordId),
      items('organizations').map(({ organization_id: organizationId, role }) => ({ gameId: recordId, organizationId, role }))
    );
    replace('event_ids', gameEvents, eq(gameEvents.gameId, recordId), items('event_ids').map((eventId) => ({ gameId: recordId, eventId })));
    replace(
      'images',
      gameImages,
      eq(gameImages.gameId, recordId),
      items('images').map(({ key, width, height, position }) => ({ gameId: recordId, key, width, height, position }))
    );
    replace(
      'milestones',
      gameMilestones,
      eq(gameMilestones.gameId, recordId),
      items('milestones').map(({ kind: step, date, date_precision: datePrecision, note }) => ({
        gameId: recordId,
        kind: step,
        date: new Date(date),
        datePrecision,
        note,
      }))
    );
  } else if (kind === 'organization') {
    replace(
      'event_ids',
      organizationEvents,
      eq(organizationEvents.organizationId, recordId),
      items('event_ids').map((eventId) => ({ organizationId: recordId, eventId }))
    );
  } else {
    replace('game_ids', gameEvents, eq(gameEvents.eventId, recordId), items('game_ids').map((gameId) => ({ gameId, eventId: recordId })));
    replace(
      'organization_ids',
      organizationEvents,
      eq(organizationEvents.eventId, recordId),
      items('organization_ids').map((organizationId) => ({ organizationId, eventId: recordId }))
    );
  }
  return statements;
}

// What a change's record was like before it, as snapshot fields; or
// 'remove' for a create; or null when that isn't known.
async function stateBefore(change) {
  if (change.operation === 'create') return 'remove';
  if (change.data?.v === 2) return change.data.before;
  // An old row (#151) holds the record after the change: before it is the
  // previous row's record, in the fields that are still columns.
  if (change.operation === 'delete') return { deleted_at: null };
  const [previous] = await db
    .select({ data: changes.data })
    .from(changes)
    .where(
      and(
        eq(changes.recordId, change.recordId),
        eq(changes.tableName, change.tableName),
        lt(changes.createdAt, change.createdAt)
      )
    )
    .orderBy(desc(changes.createdAt))
    .limit(1);
  if (!previous) return null;
  const known = COLUMN_BY_NAME(KINDS[KIND_OF_TABLE[change.tableName]].table);
  const data = previous.data?.v === 2 ? previous.data.after : previous.data;
  return Object.fromEntries(Object.entries(data ?? {}).filter(([name]) => name in known && name !== 'id'));
}

/**
 * Undoes a change, as a new change by `adminId`: puts back the record as it
 * was before (a create is undone by deleting the record, a delete by bringing
 * it back). Unless `force`, refuses when someone else changed the record
 * since, other than the changes in `ignore` (IDs).
 *
 * @returns {Promise<{ status: 'undone' | 'conflict' | 'unknown', change?: object }>}
 */
export async function undoChange(changeId, { adminId, force = false, ignore = [] }) {
  const [change] = await db.select().from(changes).where(eq(changes.id, changeId));
  const kind = change && KIND_OF_TABLE[change.tableName];
  if (!kind) return { status: 'unknown' };
  const { table } = KINDS[kind];

  if (!force) {
    const later = await db
      .select({ id: changes.id, authorId: changes.authorId })
      .from(changes)
      .where(
        and(
          eq(changes.recordId, change.recordId),
          eq(changes.tableName, change.tableName),
          gt(changes.createdAt, change.createdAt),
          ne(changes.id, change.id)
        )
      );
    if (later.some((other) => other.authorId !== change.authorId && !ignore.includes(other.id))) {
      return { status: 'conflict' };
    }
  }

  const before = await stateBefore(change);
  if (!before) return { status: 'unknown' };
  const now = new Date();
  let statements;
  if (before === 'remove') {
    statements = [db.update(table).set({ deletedAt: now, updatedAt: now, lastModifiedById: adminId }).where(eq(table.id, change.recordId))];
  } else {
    const columns = COLUMN_BY_NAME(table);
    const values = Object.fromEntries(
      Object.entries(before)
        .filter(([name]) => name in columns && name !== 'id')
        .map(([name, value]) => [columns[name].key, toValue(columns[name].column, value)])
    );
    const [current] = await db.select().from(table).where(eq(table.id, change.recordId));
    if (!current) return { status: 'unknown' };
    const merged = { ...current, ...values };
    statements = [
      db
        .update(table)
        .set({
          ...values,
          searchText: shape.searchTextOf({ name: merged.name, about: merged.about }),
          updatedAt: now,
          lastModifiedById: adminId,
        })
        .where(eq(table.id, change.recordId)),
      ...linkStatements(kind, change.recordId, before),
    ];
  }
  const undo = await recordChange({
    operation: 'update',
    kind,
    recordId: change.recordId,
    authorId: adminId,
    statements,
    undoOf: change.id,
  });
  return { status: 'undone', change: undo };
}

/**
 * Undoes every change `personId` made since `since`, newest first, as
 * `adminId`. Records someone else changed since are skipped and listed.
 *
 * @returns {Promise<{ undone: number, skipped: { id, kind, recordId, name }[] }>}
 */
export async function undoAllSince(personId, since, { adminId }) {
  const theirs = await db
    .select()
    .from(changes)
    .where(and(eq(changes.authorId, personId), gte(changes.createdAt, since)))
    .orderBy(desc(changes.createdAt));
  const ignore = [];
  const skipped = [];
  let undone = 0;
  for (const change of theirs) {
    const result = await undoChange(change.id, { adminId, ignore });
    if (result.status === 'undone') {
      undone += 1;
      if (result.change) ignore.push(result.change.id);
    } else {
      skipped.push(change);
    }
  }
  return { undone, skipped: await describe(skipped) };
}

// ---------------------------------------------------------------------------
// Reading the log

// Changes with their record's current name and address, and their author.
async function describe(rows) {
  const names = new Map();
  await Promise.all(
    Object.entries(KINDS).map(async ([kind, { table, path, name }]) => {
      const ids = rows.filter((row) => row.tableName === name).map((row) => row.recordId);
      if (ids.length === 0) return;
      const records = await db
        .select({ id: table.id, slug: table.slug, name: table.name, deletedAt: table.deletedAt })
        .from(table)
        .where(inArray(table.id, ids));
      for (const record of records) names.set(record.id, { name: record.name, path: path(record), deleted: !!record.deletedAt, kind });
    })
  );
  return rows.map((row) => ({
    id: row.id,
    operation: row.operation,
    created_at: row.createdAt,
    kind: KIND_OF_TABLE[row.tableName],
    record_id: row.recordId,
    record: names.get(row.recordId) ?? null,
    fields: row.data?.v === 2 ? Object.keys(row.data.before ?? row.data.after ?? {}) : null,
    undo_of: row.data?.undo_of ?? null,
    author: row.author ?? null,
  }));
}

/**
 * Changes for the moderation page, newest first, optionally by one person
 * (their username): a page of `limit`, and whether there are more.
 */
export async function listModerationChanges({ username = null, page = 1, limit = 50 } = {}) {
  const [person] = username
    ? await db.select({ id: people.id, username: people.username, role: people.role }).from(people).where(eq(people.username, username))
    : [];
  if (username && !person) return { changes: [], hasMore: false, person: null };
  const rows = await db.query.changes.findMany({
    where: person ? eq(changes.authorId, person.id) : undefined,
    orderBy: desc(changes.createdAt),
    limit: limit + 1,
    offset: (page - 1) * limit,
    with: { author: { columns: { id: true, username: true, role: true } } },
  });
  return { changes: await describe(rows.slice(0, limit)), hasMore: rows.length > limit, person: person ?? null };
}

/** How big the change log is (#340): rows, and bytes of data, by format. */
export async function changeLogSize() {
  const rows = await db
    .select({
      format: sql`coalesce(json_extract(${changes.data}, '$.v'), 1)`.mapWith(Number),
      rows: count(),
      bytes: sql`sum(length(${changes.data}))`.mapWith(Number),
    })
    .from(changes)
    .groupBy(sql`1`);
  return rows;
}

/**
 * The latest changes, newest first, with their author's id, names and admin
 * flag (the admin users page).
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
      record_id: row.recordId,
      author: author && {
        id: author.id,
        first_name: author.first_name,
        last_name: author.last_name,
        isAdmin: author.isAdmin,
      },
    };
  });
}

