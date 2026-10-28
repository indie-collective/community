// Duplicate games, organisations and events (#346): finding them, and
// merging two into one.
import { and, eq, inArray, isNull, max, or, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  duplicatePairs,
  eventParticipants,
  events,
  gameEvents,
  gameIgdb,
  gameImages,
  gameMilestones,
  gameOrganizations,
  games,
  gameTags,
  organizationEvents,
  organizations,
  slugAliases,
} from '../db/schema.js';
import { nameKey, siteKey, suspectedPairs } from '../utils/duplicates';
import { eventPath, eventSlug, gamePath, orgPath, slugify } from '../utils/slug';
import { recordChange } from './changes.server';
import { searchIndex } from './search.server';
import * as shape from './shapes.server';
import { freeSlug, renameSlugStatements } from './slugs.server';

const KINDS = {
  game: { table: games, path: gamePath, label: 'game' },
  organization: { table: organizations, path: orgPath, label: 'organisation' },
  event: { table: events, path: eventPath, label: 'event' },
};
export const DUPLICATE_KINDS = Object.keys(KINDS);

// What a merge chooses between, field by field: `[field, label, columns]`.
export const MERGE_FIELDS = {
  game: [
    ['name', 'Name', ['name']],
    ['about', 'About', ['about']],
    ['site', 'Website', ['site']],
    ['igdb', 'IGDB', ['igdbSlug']],
  ],
  organization: [
    ['name', 'Name', ['name']],
    ['type', 'Type', ['type']],
    ['status', 'Status', ['status']],
    ['about', 'About', ['about']],
    ['site', 'Website', ['site']],
    ['bsky', 'Bluesky', ['bskyHandle']],
    ['place', 'Place', ['countryCode', 'region', 'city', 'street', 'latitude', 'longitude']],
    ['logo', 'Logo', ['logoKey', 'logoWidth', 'logoHeight']],
  ],
  event: [
    ['name', 'Name', ['name']],
    ['when', 'Dates', ['startsAt', 'endsAt', 'timeZone']],
    ['status', 'Status', ['status']],
    ['about', 'About', ['about']],
    ['site', 'Website', ['site']],
    ['tickets', 'Tickets', ['ticketUrl']],
    ['place', 'Place', ['attendance', 'onlineUrl', 'countryCode', 'region', 'city', 'street', 'latitude', 'longitude']],
    ['cover', 'Cover', ['coverKey', 'coverWidth', 'coverHeight']],
    ['previous', 'Previous edition', ['previousEditionId']],
  ],
};

const orderedPair = (a, b) => (a < b ? [a, b] : [b, a]);
const isEmpty = (value) => value == null || value === '';

// ---------------------------------------------------------------------------
// Before adding: "is it one of these?"

const REASON_ORDER = ['same website', 'same name', 'similar name'];

/**
 * Records of `kind` that may be the one being added: the same name (once
 * reduced, see utils/duplicates) or website first, then the best search
 * matches. `{ id, name, path, reason }`, at most 5.
 */
export async function findLikelyDuplicates(kind, { name, site, excludeId = null }) {
  const { table, path } = KINDS[kind];
  const key = nameKey(name);
  const exact = { exact: kind !== 'organization' };
  const siteMatch = siteKey(site, exact);
  const typed = (name ?? '').trim().toLowerCase();
  const [found, containing] = await Promise.all([
    searchIndex(name ?? '', { kinds: [kind], limit: 10 }),
    // Names containing what's typed first: search ranks by words.
    typed.length >= 2
      ? db
          .select({ id: table.id })
          .from(table)
          .where(and(isNull(table.deletedAt), sql`lower(${table.name}) like ${`%${typed}%`}`))
          .limit(5)
      : [],
  ]);
  const ids = [...new Set([...containing.map((row) => row.id), ...(found?.hits ?? []).map((hit) => hit.id)])];
  const rank = (id) => (ids.includes(id) ? ids.indexOf(id) : ids.length);
  const rows = await db
    .select({ id: table.id, slug: table.slug, name: table.name, site: table.site })
    .from(table)
    .where(
      and(
        isNull(table.deletedAt),
        or(ids.length > 0 ? inArray(table.id, ids) : undefined, site ? eq(table.site, site) : undefined)
      )
    );
  return rows
    .filter((row) => row.id !== excludeId)
    .map((row) => ({
      id: row.id,
      name: row.name,
      path: path(row),
      reason:
        siteMatch && siteKey(row.site, exact) === siteMatch
          ? 'same website'
          : key && nameKey(row.name) === key
            ? 'same name'
            : 'similar name',
    }))
    // Same website, then same name, then the search's best matches first.
    .sort(
      (a, b) =>
        REASON_ORDER.indexOf(a.reason) - REASON_ORDER.indexOf(b.reason) ||
        rank(a.id) - rank(b.id)
    )
    .slice(0, 5);
}

/**
 * A live record of `kind` with the same website as `site`, but `excludeId`:
 * `{ id, name, path }`, or null. Adding or saving a second one is refused.
 */
export async function recordWithSite(kind, site, { excludeId = null } = {}) {
  const exact = { exact: kind !== 'organization' };
  const key = siteKey(site, exact);
  if (!key || kind === 'event') return null;
  const { table, path } = KINDS[kind];
  const host = key.split('/')[0];
  // Those on the same host, then compared exactly.
  const rows = await db
    .select({ id: table.id, slug: table.slug, name: table.name, site: table.site })
    .from(table)
    .where(and(isNull(table.deletedAt), sql`lower(${table.site}) like ${`%${host}%`}`));
  const same = rows.find((row) => row.id !== excludeId && siteKey(row.site, exact) === key);
  return same ? { id: same.id, name: same.name, path: path(same) } : null;
}

/** Refuses a website another record of `kind` already has, with a 409. */
export async function assertSiteIsFree(kind, site, { excludeId } = {}) {
  const other = await recordWithSite(kind, site, { excludeId });
  if (other) {
    throw new Response(`“${other.name}” already has this website. Is it the same ${KINDS[kind].label}? ${other.path}`, {
      status: 409,
      statusText: 'Conflict',
    });
  }
}

// ---------------------------------------------------------------------------
// Finding them: the admin view

const summary = (kind, row) => ({
  id: row.id,
  name: row.name,
  path: KINDS[kind].path(row),
  site: row.site,
  city: row.city ?? null,
  starts_at: row.startsAt ?? null,
  created_at: row.createdAt,
});

/**
 * Pairs of `kind` records that may be duplicates: suspected (see
 * utils/duplicates) or flagged by members, minus those an admin dismissed.
 * `{ reasons, flagged, a, b }` with both records' summaries.
 */
export async function listSuspectedDuplicates(kind) {
  const { table } = KINDS[kind];
  const [rows, marked] = await Promise.all([
    db.select().from(table).where(isNull(table.deletedAt)),
    db.select().from(duplicatePairs).where(eq(duplicatePairs.kind, kind)),
  ]);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const dismissed = new Set(marked.filter((m) => m.status === 'dismissed').map((m) => `${m.firstId}:${m.secondId}`));
  const flagged = marked.filter((m) => m.status === 'flagged');

  const suspected = suspectedPairs(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      site: row.site,
      bsky_handle: row.bskyHandle,
      starts_at: row.startsAt,
      city: row.city,
    })),
    { events: kind === 'event', exactSites: kind !== 'organization' }
  );
  const pairs = new Map(suspected.map((pair) => [`${pair.a}:${pair.b}`, { ...pair, flagged: false }]));
  for (const flag of flagged) {
    const key = `${flag.firstId}:${flag.secondId}`;
    const pair = pairs.get(key) ?? { a: flag.firstId, b: flag.secondId, reasons: [] };
    pairs.set(key, { ...pair, reasons: [...pair.reasons, 'flagged by a member'], flagged: true });
  }
  return [...pairs.entries()]
    .filter(([key, pair]) => !dismissed.has(key) && byId.has(pair.a) && byId.has(pair.b))
    .map(([, pair]) => ({
      reasons: pair.reasons,
      flagged: pair.flagged,
      a: summary(kind, byId.get(pair.a)),
      b: summary(kind, byId.get(pair.b)),
    }))
    .sort((x, y) => y.flagged - x.flagged || y.reasons.length - x.reasons.length)
    .slice(0, 200);
}

/** A member says two records are the same one. */
export async function flagDuplicate(kind, recordId, otherId, { personId }) {
  if (recordId === otherId) return;
  const [firstId, secondId] = orderedPair(recordId, otherId);
  await db
    .insert(duplicatePairs)
    .values({ kind, firstId, secondId, status: 'flagged', personId })
    .onConflictDoNothing();
}

/** An admin says two records aren't the same: not suggested again. */
export async function dismissDuplicate(kind, a, b, { personId }) {
  const [firstId, secondId] = orderedPair(a, b);
  await db
    .insert(duplicatePairs)
    .values({ kind, firstId, secondId, status: 'dismissed', personId })
    .onConflictDoUpdate({
      target: [duplicatePairs.kind, duplicatePairs.firstId, duplicatePairs.secondId],
      set: { status: 'dismissed', personId },
    });
}

// ---------------------------------------------------------------------------
// Merging

/** Two live records of `kind` side by side for the merge page, or null. */
export async function getMergeCandidates(kind, a, b) {
  const { table } = KINDS[kind];
  const rows = await db
    .select()
    .from(table)
    .where(and(inArray(table.id, [a, b]), isNull(table.deletedAt)));
  if (rows.length !== 2 || a === b) return null;
  const toShape = { game: shape.game, organization: shape.organization, event: shape.event }[kind];
  const records = [a, b].map((id) => rows.find((row) => row.id === id));
  const values = (row) =>
    Object.fromEntries(MERGE_FIELDS[kind].map(([field, , columns]) => [field, columns.map((column) => row[column])]));
  return {
    fields: MERGE_FIELDS[kind].map(([field, label]) => [field, label]),
    records: records.map((row) => ({
      ...summary(kind, row),
      updated_at: row.updatedAt,
      record: toShape(row),
      values: values(row),
    })),
  };
}

/**
 * The default choice for each field: the value that isn't empty, else the
 * most recently updated record's. `records` as getMergeCandidates gives them;
 * the choice is the index of the record to take the field from.
 */
export function defaultChoices({ fields, records }) {
  const newer = records[0].updated_at >= records[1].updated_at ? 0 : 1;
  return Object.fromEntries(
    fields.map(([field]) => {
      const empty = records.map((record) => record.values[field].every(isEmpty));
      return [field, empty[newer] && !empty[1 - newer] ? 1 - newer : newer];
    })
  );
}

// Statements moving a record's links from `otherId` to `keepId`, on `kind`'s
// link tables. Links both had become one.
async function moveLinks(kind, keepId, otherId) {
  const statements = [];
  const move = async (table, column, { dropColumns = [], adjust = (row) => row } = {}) => {
    const rows = await db.select().from(table).where(eq(table[column], otherId));
    if (rows.length === 0) return;
    statements.push(db.delete(table).where(eq(table[column], otherId)));
    const moved = rows.map((row) => {
      const copy = adjust({ ...row, [column]: keepId });
      for (const drop of dropColumns) delete copy[drop];
      return copy;
    });
    statements.push(db.insert(table).values(moved).onConflictDoNothing());
  };
  if (kind === 'game') {
    await move(gameTags, 'gameId');
    await move(gameOrganizations, 'gameId');
    await move(gameEvents, 'gameId');
    await move(gameMilestones, 'gameId', { dropColumns: ['id'] });
    // The other's images after the kept one's.
    const [{ last } = {}] = await db
      .select({ last: max(gameImages.position) })
      .from(gameImages)
      .where(eq(gameImages.gameId, keepId));
    const start = (last ?? -1) + 1;
    await move(gameImages, 'gameId', { dropColumns: ['id'], adjust: (row) => ({ ...row, position: start + row.position }) });
    // IGDB data only when the kept game has none.
    const [kept] = await db.select({ gameId: gameIgdb.gameId }).from(gameIgdb).where(eq(gameIgdb.gameId, keepId));
    if (!kept) await move(gameIgdb, 'gameId');
  } else if (kind === 'organization') {
    await move(gameOrganizations, 'organizationId');
    await move(organizationEvents, 'organizationId');
  } else {
    await move(gameEvents, 'eventId');
    await move(organizationEvents, 'eventId');
    await move(eventParticipants, 'eventId');
    statements.push(db.update(events).set({ previousEditionId: keepId }).where(eq(events.previousEditionId, otherId)));
  }
  return statements;
}

/**
 * Merges `otherId` into `keepId` (#346), as `adminId`: the kept record takes
 * the other's value for each field `choices` says (`{ field: 'other' }`),
 * and all its links; the other is deleted, and its address and ID lead to
 * the kept one. Both changes are in the log.
 *
 * @returns {Promise<{ id, slug }>} the kept record
 */
export async function mergeRecords(kind, keepId, otherId, choices, { adminId }) {
  const { table } = KINDS[kind];
  const [keep, other] = await Promise.all(
    [keepId, otherId].map(async (id) => (await db.select().from(table).where(and(eq(table.id, id), isNull(table.deletedAt))))[0])
  );
  if (!keep || !other || keepId === otherId) throw new Response('Not Found', { status: 404 });

  const taken = {};
  for (const [field, , columns] of MERGE_FIELDS[kind]) {
    if (choices[field] !== 'other') continue;
    for (const column of columns) taken[column] = other[column];
  }
  if (taken.previousEditionId === keepId) taken.previousEditionId = null;
  const merged = { ...keep, ...taken };
  const slug =
    merged.name === keep.name && kind !== 'event'
      ? keep.slug
      : await freeSlug(kind, kind === 'event' ? eventSlug(merged.name, merged.startsAt) : slugify(merged.name), {
          recordId: keepId,
        });

  // The other goes first, so its own change records it as it was.
  await recordChange({
    operation: 'delete',
    kind,
    recordId: otherId,
    authorId: adminId,
    note: { merged_into: keepId },
    statements: [
      db
        .update(table)
        .set({
          deletedAt: new Date(),
          lastModifiedById: adminId,
          // Unique, and the kept record may take them: its slug becomes an
          // alias of the kept record (below), its IGDB link moves.
          slug: null,
          ...(kind === 'game' ? { igdbSlug: null } : {}),
        })
        .where(eq(table.id, otherId)),
      // Its addresses lead to the kept record.
      db
        .insert(slugAliases)
        .values([
          ...(other.slug ? [{ kind, slug: other.slug, recordId: keepId }] : []),
          { kind, slug: otherId, recordId: keepId },
        ])
        .onConflictDoUpdate({ target: [slugAliases.kind, slugAliases.slug], set: { recordId: keepId } }),
    ],
  });

  await recordChange({
    operation: 'update',
    kind,
    recordId: keepId,
    authorId: adminId,
    note: { merged_from: otherId },
    statements: [
      db
        .update(table)
        .set({
          ...taken,
          slug,
          searchText: shape.searchTextOf({ name: merged.name, about: merged.about }),
          lastModifiedById: adminId,
          updatedAt: new Date(),
        })
        .where(eq(table.id, keepId)),
      ...renameSlugStatements(kind, keepId, keep.slug, slug),
      ...(await moveLinks(kind, keepId, otherId)),
      db
        .delete(duplicatePairs)
        .where(
          and(
            eq(duplicatePairs.kind, kind),
            eq(duplicatePairs.firstId, orderedPair(keepId, otherId)[0]),
            eq(duplicatePairs.secondId, orderedPair(keepId, otherId)[1])
          )
        ),
    ],
  });
  return { id: keepId, slug };
}
