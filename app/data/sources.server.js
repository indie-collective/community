// Records' pages elsewhere (#338): kept apart from the records, read again
// every week, and used to fill in what's empty, under the bot account, in
// the change log like any edit.
import { and, desc, eq, inArray, isNotNull, isNull, lt, or, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { changes, events, games, organizations, sources } from '../db/schema.js';
import { readSource } from '../utils/sourceFetch.server';
import { detectSource, fillsFor } from '../utils/sources';
import { recordChange } from './changes.server';
import { botAccountId } from './people.server';
import { searchTextOf } from './shapes.server';

const RECORDS = {
  game: { table: games, name: 'games' },
  organization: { table: organizations, name: 'organizations' },
  event: { table: events, name: 'events' },
};
// A fillable field's column.
const COLUMNS = { about: 'about', site: 'site', bsky_handle: 'bskyHandle', ticket_url: 'ticketUrl' };

const STALE = 7 * 86400000;
const RUNNING = 10 * 60000;

/**
 * What a link says about a record of `kind`, for its add form: `{ source,
 * url, fields }`; `fields` null when it says nothing. Throws when the link
 * isn't one, or can't be read.
 */
export async function prefillFrom(kind, link) {
  const detected = detectSource(link);
  if (!detected) throw new Error("That isn't a link.");
  return { source: detected.source, url: detected.url, fields: await readSource(kind, detected) };
}

/** Links a record to one of its pages elsewhere (already linked is fine). */
export async function addSource(kind, recordId, link) {
  const detected = detectSource(link);
  if (!detected || !RECORDS[kind]) return;
  await db
    .insert(sources)
    .values({ recordType: kind, recordId, source: detected.source, url: detected.url })
    .onConflictDoNothing();
}

/** A record's sources, for its page: `{ source, url, filled }`. */
export async function listRecordSources(kind, recordId) {
  const rows = await db
    .select({ source: sources.source, url: sources.url, filled: sources.filled })
    .from(sources)
    .where(and(eq(sources.recordType, kind), eq(sources.recordId, recordId)));
  return rows;
}

// Every record with a website gets it as a source: what it links to is its
// own page (certain matches only, #338).
async function linkWebsites(limit) {
  let linked = 0;
  for (const [kind, { table }] of Object.entries(RECORDS)) {
    const rows = await db
      .select({ id: table.id, site: table.site })
      .from(table)
      .where(
        and(
          isNull(table.deletedAt),
          isNotNull(table.site),
          sql`${table.site} <> ''`,
          sql`not exists (select 1 from ${sources} where ${sources.recordType} = ${kind} and ${sources.recordId} = ${table.id})`
        )
      )
      .limit(limit - linked);
    for (const row of rows) {
      await addSource(kind, row.id, row.site);
      linked += 1;
    }
    if (linked >= limit) break;
  }
  return linked;
}

// The fields people edited on a record, from the change log: they're
// theirs, never filled again.
async function editedFields(kind, recordId, botId) {
  const rows = await db
    .select({ data: changes.data, authorId: changes.authorId, operation: changes.operation })
    .from(changes)
    .where(and(eq(changes.tableName, RECORDS[kind].name), eq(changes.recordId, recordId)));
  const edited = new Set();
  for (const row of rows) {
    if (row.authorId === botId) continue;
    // An update names what changed (a field emptied on purpose included); a
    // create, and the old rows (#151), hold the whole record: only what had
    // a value was entered.
    const after = row.data?.v === 2 ? (row.data.after ?? {}) : (row.data ?? {});
    const updated = row.data?.v === 2 && row.operation === 'update';
    const fields = Object.keys(after).filter((key) => updated || (after[key] != null && after[key] !== ''));
    for (const field of fields) edited.add(field);
  }
  return [...edited];
}

/**
 * Reads the stalest sources again (never read first, then those over a
 * week old), at most `limit`, or `only` one record's, and fills in what
 * their records have empty.
 *
 * @returns {Promise<{ linked: number, read: number, filled: number }>}
 */
export async function refreshSources({ limit = 10, now = new Date(), only = null } = {}) {
  // `only`: one record's sources, read now (`{ kind, id }`), its website linked first.
  if (only) {
    const { table } = RECORDS[only.kind];
    const [record] = await db.select({ site: table.site }).from(table).where(eq(table.id, only.id));
    if (record?.site) await addSource(only.kind, only.id, record.site);
  }
  const linked = only ? 0 : await linkWebsites(limit);
  const due = await db
    .select()
    .from(sources)
    .where(
      only
        ? and(eq(sources.recordType, only.kind), eq(sources.recordId, only.id))
        : and(
            or(isNull(sources.fetchedAt), lt(sources.fetchedAt, new Date(now.getTime() - STALE))),
            or(isNull(sources.refreshStartedAt), lt(sources.refreshStartedAt, new Date(now.getTime() - RUNNING)))
          )
    )
    .orderBy(sql`${sources.fetchedAt} is not null`, sources.fetchedAt)
    .limit(limit);
  if (due.length === 0) return { linked, read: 0, filled: 0 };
  await db.update(sources).set({ refreshStartedAt: now }).where(inArray(sources.id, due.map((row) => row.id)));

  const botId = await botAccountId();
  let filled = 0;
  for (const row of due) {
    let fields = null;
    let error = null;
    try {
      fields = await readSource(row.recordType, detectSource(row.url));
    } catch (err) {
      error = String(err.message ?? err).slice(0, 500);
    }
    await db.update(sources).set({ data: fields, error, fetchedAt: now, refreshStartedAt: null }).where(eq(sources.id, row.id));
    if (!fields) continue;

    const { table } = RECORDS[row.recordType];
    const [record] = await db.select().from(table).where(and(eq(table.id, row.recordId), isNull(table.deletedAt)));
    if (!record) continue;
    const current = { about: record.about, site: record.site, bsky_handle: record.bskyHandle, ticket_url: record.ticketUrl };
    const fills = fillsFor(row.recordType, current, fields, await editedFields(row.recordType, row.recordId, botId));
    if (Object.keys(fills).length === 0) continue;

    const values = Object.fromEntries(Object.entries(fills).map(([field, value]) => [COLUMNS[field], value]));
    await recordChange({
      operation: 'update',
      kind: row.recordType,
      recordId: row.recordId,
      authorId: botId,
      note: { source: row.source, source_url: row.url },
      statements: [
        db
          .update(table)
          .set({
            ...values,
            searchText: searchTextOf({ name: record.name, about: values.about ?? record.about }),
            lastModifiedById: botId,
            updatedAt: now,
          })
          .where(eq(table.id, row.recordId)),
      ],
    });
    await db.update(sources).set({ filled: { ...(row.filled ?? {}), ...fills } }).where(eq(sources.id, row.id));
    filled += 1;
  }
  return { linked, read: due.length, filled };
}

/** The latest sources read, for the admin page: with their record's name. */
export async function listRecentSources({ limit = 50 } = {}) {
  const rows = await db.select().from(sources).orderBy(desc(sources.fetchedAt), desc(sources.createdAt)).limit(limit);
  const names = new Map();
  for (const [kind, { table }] of Object.entries(RECORDS)) {
    const ids = rows.filter((row) => row.recordType === kind).map((row) => row.recordId);
    if (ids.length === 0) continue;
    for (const record of await db.select({ id: table.id, name: table.name, slug: table.slug }).from(table).where(inArray(table.id, ids))) {
      names.set(record.id, record);
    }
  }
  return rows.map((row) => ({
    id: row.id,
    kind: row.recordType,
    source: row.source,
    url: row.url,
    record: names.get(row.recordId) ?? null,
    filled: Object.keys(row.filled ?? {}),
    error: row.error,
    fetched_at: row.fetchedAt,
  }));
}
