// Fact-finding missions (#339): records with a gap handed to members one at
// a time, what they fill in, skip or flag, and what it earns them. Gaps are
// utils/missions' GAPS; here, which records have them.
import { and, asc, count, desc, eq, gt, gte, inArray, isNull, lt, ne, notExists, or, sql } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import {
  changes,
  events,
  gameImages,
  gameMilestones,
  gameOrganizations,
  games,
  gameTags,
  missionClaims,
  organizationEvents,
  organizations,
  people,
} from '../db/schema.js';
import { checkBlueskyHandle } from '../utils/bluesky.server';
import { FLAG_REASONS, GAPS, achievementProgress, achievementsOf, gapOf, tally } from '../utils/missions';

export { FLAG_REASONS, MISSION_KINDS } from '../utils/missions';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import { webUrl } from '../utils/url';
import { recordChange } from './changes.server';
import { setTagsStatements } from './games.server';
import { searchTextOf } from './shapes.server';
import { resolveTagNames } from './tags.server';

const RECORDS = {
  game: { table: games, path: gamePath, name: 'games', edit: (r) => `/game/${r.id}/edit` },
  organization: { table: organizations, path: orgPath, name: 'organizations', edit: (r) => `/org/${r.id}/edit` },
  event: { table: events, path: eventPath, name: 'events', edit: (r) => `/event/${r.id}/edit` },
};

const blank = (column) => or(isNull(column), eq(column, ''));
const none = (table, column, id) => notExists(db.select({ one: sql`1` }).from(table).where(eq(column, id)));

// The SQL for "has this gap", by kind and gap key.
const WHERE = {
  game: {
    about: () => blank(games.about),
    studio: () => none(gameOrganizations, gameOrganizations.gameId, games.id),
    images: () => none(gameImages, gameImages.gameId, games.id),
    tags: () => none(gameTags, gameTags.gameId, games.id),
    site: () => blank(games.site),
    igdb: () => isNull(games.igdbSlug),
    timeline: () => none(gameMilestones, gameMilestones.gameId, games.id),
  },
  organization: {
    place: () => isNull(organizations.countryCode),
    about: () => blank(organizations.about),
    logo: () => isNull(organizations.logoKey),
    site: () => blank(organizations.site),
    bluesky: () => blank(organizations.bskyHandle),
  },
  event: {
    about: () => blank(events.about),
    hosts: () => none(organizationEvents, organizationEvents.eventId, events.id),
    cover: () => isNull(events.coverKey),
    site: () => blank(events.site),
    tickets: () => blank(events.ticketUrl),
  },
};

const live = (kind) => isNull(RECORDS[kind].table.deletedAt);

/** How many records of each kind have each gap: `{ game: { about: 12, … }, … }`. */
export async function countGaps() {
  const result = {};
  for (const [kind, gaps] of Object.entries(GAPS)) {
    const { table } = RECORDS[kind];
    const counts = await Promise.all(
      gaps.map(async (gap) => (await db.select({ value: count() }).from(table).where(and(live(kind), WHERE[kind][gap.key]())))[0].value)
    );
    result[kind] = Object.fromEntries(gaps.map((gap, i) => [gap.key, counts[i]]));
  }
  return result;
}

/** A page of the records with a gap, newest first: `{ id, name, path }`, and whether there are more. */
export async function listGapRecords(kind, key, { page = 1, pageSize = 50 } = {}) {
  const { table, path } = RECORDS[kind];
  const rows = await db
    .select({ id: table.id, slug: table.slug, name: table.name })
    .from(table)
    .where(and(live(kind), WHERE[kind][key]()))
    .orderBy(desc(table.createdAt))
    .offset((page - 1) * pageSize)
    .limit(pageSize + 1);
  return { records: rows.slice(0, pageSize).map((row) => ({ id: row.id, name: row.name, path: path(row) })), hasMore: rows.length > pageSize };
}

const CLAIM_FOR = 30 * 60000;
const SKIP_FOR = 30 * 86400000;

/**
 * The next record of `kind` with `key` missing for a member, claimed for
 * them: not being worked on by someone else, not one they skipped lately,
 * completed or flagged; those skipped by many people last. Null when none.
 * `{ kind, gap, record: { id, name, path, edit, about, site, … } }`.
 */
export async function nextMissionRecord(personId, kind, key, now = new Date()) {
  const { table, path, edit } = RECORDS[kind];
  const mine = (statuses, since) =>
    db
      .select({ one: sql`1` })
      .from(missionClaims)
      .where(
        and(
          eq(missionClaims.personId, personId),
          eq(missionClaims.recordType, kind),
          eq(missionClaims.recordId, table.id),
          inArray(missionClaims.status, statuses),
          since ? gt(missionClaims.updatedAt, since) : undefined
        )
      );
  const [row] = await db
    .select()
    .from(table)
    .where(
      and(
        live(kind),
        WHERE[kind][key](),
        // Someone else is on it.
        notExists(
          db
            .select({ one: sql`1` })
            .from(missionClaims)
            .where(
              and(
                ne(missionClaims.personId, personId),
                eq(missionClaims.recordType, kind),
                eq(missionClaims.recordId, table.id),
                eq(missionClaims.status, 'claimed'),
                gt(missionClaims.updatedAt, new Date(now.getTime() - CLAIM_FOR))
              )
            )
        ),
        notExists(mine(['done', 'flagged', 'resolved'])),
        notExists(mine(['skipped'], new Date(now.getTime() - SKIP_FOR)))
      )
    )
    .orderBy(
      asc(
        sql`(select count(*) from ${missionClaims} where ${missionClaims.recordType} = ${kind} and ${missionClaims.recordId} = ${table.id} and ${missionClaims.status} = 'skipped')`
      ),
      desc(table.createdAt)
    )
    .limit(1);
  if (!row) return null;
  await setClaim(personId, kind, row.id, key, 'claimed', null, now);
  return {
    kind,
    gap: key,
    record: {
      id: row.id,
      name: row.name,
      path: path(row),
      edit: edit(row),
      about: row.about,
      site: row.site,
      type: row.type ?? null,
      city: row.city ?? null,
      country_code: row.countryCode ?? null,
      starts_at: row.startsAt ?? null,
    },
  };
}

function setClaim(personId, recordType, recordId, gap, status, reason = null, now = new Date()) {
  return db
    .insert(missionClaims)
    .values({ personId, recordType, recordId, gap, status, reason, updatedAt: now })
    .onConflictDoUpdate({
      target: [missionClaims.personId, missionClaims.recordType, missionClaims.recordId],
      set: { gap, status, reason, updatedAt: now },
    });
}

/**
 * Fills a gap in place, as the member's change (the usual change log, and
 * its limits): `value` as typed. Throws an Error with a message for the form
 * when it isn't valid.
 */
export async function fillGap(personId, kind, recordId, key, value) {
  const gap = gapOf(kind, key);
  if (!gap?.input) throw new Error('This one is added on its page.');
  const { table } = RECORDS[kind];
  const [record] = await db.select().from(table).where(and(eq(table.id, recordId), live(kind)));
  if (!record) throw new Error('It was deleted.');
  const text = String(value ?? '').trim();
  if (!text) throw new Error('Fill it in, or skip it.');
  const now = new Date();
  const statements = [];
  const set = (values) =>
    statements.push(
      db
        .update(table)
        .set({ ...values, searchText: searchTextOf({ name: record.name, about: values.about ?? record.about }), lastModifiedById: personId, updatedAt: now })
        .where(eq(table.id, recordId))
    );
  if (gap.input === 'text') set({ about: text });
  if (gap.input === 'url') {
    const url = webUrl(text);
    if (!url) throw new Error("That isn't a web address.");
    set(key === 'tickets' ? { ticketUrl: url } : { site: url });
  }
  if (gap.input === 'bluesky') set({ bskyHandle: await checkBlueskyHandle(text) });
  if (gap.input === 'igdb') {
    const slug = /igdb\.com\/games\/([^/?#]+)/.exec(text)?.[1] ?? (/^[a-z0-9-]+$/.test(text) ? text : null);
    if (!slug) throw new Error("That isn't an IGDB game page (https://www.igdb.com/games/…).");
    set({ igdbSlug: slug });
  }
  if (gap.input === 'tags') {
    const names = await resolveTagNames(text);
    if (names.length === 0) throw new Error('Give it at least one tag.');
    statements.push(...setTagsStatements(recordId, names, now));
    set({});
  }
  await recordChange({ operation: 'update', kind, recordId, authorId: personId, statements, note: { mission: key } });
  await setClaim(personId, kind, recordId, key, 'done');
}

/** The member doesn't know: it isn't given to them again for a month. */
export const skipRecord = (personId, kind, recordId, key) => setClaim(personId, kind, recordId, key, 'skipped');

/** Worked on from its page (a gap without an input): done for this mission. */
export const completeRecord = (personId, kind, recordId, key) => setClaim(personId, kind, recordId, key, 'done');

/** The member says something's off with it: for admins to check. */
export const flagRecord = (personId, kind, recordId, key, reason) =>
  setClaim(personId, kind, recordId, key, 'flagged', FLAG_REASONS.some(([value]) => value === reason) ? reason : 'wrong');

/** Records flagged on missions, newest first, for /admin/missing. */
export async function listMissionFlags() {
  const rows = await db
    .select({ claim: missionClaims, username: people.username })
    .from(missionClaims)
    .innerJoin(people, eq(people.id, missionClaims.personId))
    .where(eq(missionClaims.status, 'flagged'))
    .orderBy(desc(missionClaims.updatedAt))
    .limit(200);
  const names = new Map();
  for (const [kind, { table, path }] of Object.entries(RECORDS)) {
    const ids = rows.filter(({ claim }) => claim.recordType === kind).map(({ claim }) => claim.recordId);
    if (ids.length === 0) continue;
    for (const record of await db.select({ id: table.id, slug: table.slug, name: table.name }).from(table).where(inArray(table.id, ids))) {
      names.set(record.id, { name: record.name, path: path(record) });
    }
  }
  return rows
    .filter(({ claim }) => names.has(claim.recordId))
    .map(({ claim, username }) => ({
      kind: claim.recordType,
      record_id: claim.recordId,
      person_id: claim.personId,
      username,
      reason: claim.reason,
      flagged_at: claim.updatedAt,
      ...names.get(claim.recordId),
    }));
}

/** An admin has dealt with a flag. */
export async function resolveFlag(personId, kind, recordId) {
  await db
    .update(missionClaims)
    .set({ status: 'resolved', updatedAt: new Date() })
    .where(and(eq(missionClaims.personId, personId), eq(missionClaims.recordType, kind), eq(missionClaims.recordId, recordId)));
}

const KIND_OF = { games: 'game', organizations: 'organization', events: 'event' };

/**
 * A member's points, counts and achievements (see utils/missions' tally),
 * from their changes and the records they completed on missions: all, or
 * from `since`, or before `before`.
 */
export async function memberStats(personId, { since, before } = {}) {
  const when = (column) => and(since ? gte(column, since) : undefined, before ? lt(column, before) : undefined);
  const [rows, undone, [{ value: missions }]] = await Promise.all([
    db
      .select({ id: changes.id, operation: changes.operation, tableName: changes.tableName, recordId: changes.recordId, data: changes.data })
      .from(changes)
      .where(and(eq(changes.authorId, personId), when(changes.createdAt))),
    db.select({ id: sql`json_extract(${changes.data}, '$.undo_of')` }).from(changes).where(sql`json_extract(${changes.data}, '$.undo_of') is not null`),
    db
      .select({ value: count() })
      .from(missionClaims)
      .where(and(eq(missionClaims.personId, personId), eq(missionClaims.status, 'done'), when(missionClaims.updatedAt))),
  ]);
  const totals = tally(
    rows.map((row) => ({ id: row.id, operation: row.operation, kind: KIND_OF[row.tableName], record_id: row.recordId, data: row.data })),
    { undone: new Set(undone.map((row) => row.id)), missions }
  );
  return { ...totals, achievements: achievementsOf(totals), progress: achievementProgress(totals) };
}
