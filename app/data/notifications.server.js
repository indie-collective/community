// Follows and notifications (#343): who follows what, and what they're told
// when it changes. Notifications are written after a change is recorded
// (data/changes.server), never in the request.
import { and, count, desc, eq, gte, inArray, isNull, lt, ne, sql } from 'drizzle-orm';

import countryNames from '../assets/countries.json';
import { db } from '../db/index.server.js';
import {
  eventParticipants,
  events,
  follows,
  FOLLOW_TYPES,
  games,
  notifications,
  opportunities,
  organizations,
} from '../db/schema.js';
import { formatMilestoneDate, milestoneLabel } from '../utils/gameTimeline';
import { noticesFor } from '../utils/notifications';
import { ORG_STATUSES, orgTypeLabel } from '../utils/orgTypes';
import { eventPath, gamePath, orgPath } from '../utils/slug';

export { FOLLOW_TYPES };

// ---------------------------------------------------------------------------
// Following

/** Follows or stops following a game, organisation, event or country. */
export async function setFollowing(personId, recordType, recordId, following) {
  if (following) {
    await db.insert(follows).values({ personId, recordType, recordId }).onConflictDoNothing();
  } else {
    await db
      .delete(follows)
      .where(and(eq(follows.personId, personId), eq(follows.recordType, recordType), eq(follows.recordId, recordId)));
  }
}

/** Whether a person follows a record (false when signed out). */
export async function isFollowing(personId, recordType, recordId) {
  if (!personId) return false;
  const [row] = await db
    .select({ one: sql`1` })
    .from(follows)
    .where(and(eq(follows.personId, personId), eq(follows.recordType, recordType), eq(follows.recordId, recordId)));
  return Boolean(row);
}

const RECORDS = {
  game: { table: games, path: gamePath },
  organization: { table: organizations, path: orgPath },
  event: { table: events, path: eventPath },
};

// The live records of each type among `ids`: `Map(id → row)`.
async function recordsById(type, ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  if (type === 'opportunity') {
    const rows = await db.select().from(opportunities).where(inArray(opportunities.id, unique));
    return new Map(rows.map((row) => [row.id, row]));
  }
  const { table } = RECORDS[type];
  const rows = await db.select().from(table).where(and(inArray(table.id, unique), isNull(table.deletedAt)));
  return new Map(rows.map((row) => [row.id, row]));
}

/** What a person follows: `{ type, id, name, path }`, newest first. */
export async function listFollowing(personId) {
  const rows = await db.select().from(follows).where(eq(follows.personId, personId)).orderBy(desc(follows.createdAt));
  const found = Object.fromEntries(
    await Promise.all(
      ['game', 'organization', 'event'].map(async (type) => [
        type,
        await recordsById(
          type,
          rows.filter((row) => row.recordType === type).map((row) => row.recordId)
        ),
      ])
    )
  );
  return rows
    .map((row) => {
      if (row.recordType === 'country') {
        const name = countryNames[row.recordId];
        return name && { type: 'country', id: row.recordId, name, path: `/country/${row.recordId.toLowerCase()}` };
      }
      const record = found[row.recordType].get(row.recordId);
      return record && { type: row.recordType, id: row.recordId, name: record.name, path: RECORDS[row.recordType].path(record) };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Telling followers

// A notice's message and address, from the records it refers to.
function describe(notice, names) {
  const { refs } = notice;
  const game = names.game.get(refs.game);
  const org = names.organization.get(refs.organization);
  const event = names.event.get(refs.event);
  const opportunity = names.opportunity.get(refs.opportunity);
  switch (notice.kind) {
    case 'new_org':
      return org && {
        message: `New ${orgTypeLabel(org.type).toLowerCase()} in ${countryNames[org.countryCode] ?? org.countryCode}: ${org.name}`,
        path: orgPath(org),
      };
    case 'org_status':
      return org && { message: `${org.name} is now ${ORG_STATUSES[refs.status]?.label.toLowerCase() ?? refs.status}`, path: orgPath(org) };
    case 'org_game':
      return org && game && {
        message: refs.role === 'publisher' ? `${org.name} published ${game.name}` : `${org.name} made ${game.name}`,
        path: gamePath(game),
      };
    case 'game_publisher':
      return org && game && { message: `${game.name} has a new publisher: ${org.name}`, path: gamePath(game) };
    case 'game_milestone':
      return game && {
        message: `${game.name}: ${milestoneLabel(refs.milestone.kind)} (${formatMilestoneDate(
          new Date(refs.milestone.date),
          refs.milestone.date_precision
        )})`,
        path: gamePath(game),
      };
    case 'game_event':
      return game && event && { message: `${game.name} will be at ${event.name}`, path: eventPath(event) };
    case 'event_game':
      return game && event && { message: `${event.name}: ${game.name} will be there`, path: eventPath(event) };
    case 'new_event':
      return event && {
        message: `New event in ${countryNames[event.countryCode] ?? event.countryCode}: ${event.name}`,
        path: eventPath(event),
      };
    case 'org_event':
      return org && event && { message: `${org.name} hosts ${event.name}`, path: eventPath(event) };
    case 'event_changed': {
      if (!event) return null;
      const what = refs.fields.some((f) => ['starts_at', 'ends_at', 'time_zone'].includes(f)) ? ['dates'] : [];
      if (refs.fields.some((f) => !['starts_at', 'ends_at', 'time_zone', 'status'].includes(f))) what.push('place');
      return {
        message: refs.canceled ? `${event.name} was canceled` : `${event.name} changed: new ${what.join(' and ') || 'status'}`,
        path: eventPath(event),
      };
    }
    case 'opportunity': {
      const by = org ?? game ?? event;
      return opportunity && by && { message: `${by.name} posted: ${opportunity.title}`, path: `/opportunities#${opportunity.id}` };
    }
    default:
      return null;
  }
}

// Followers of each audience, but `exceptId`: `Map("type:id" → personIds)`.
async function followersOf(audiences, exceptId) {
  const keys = [...new Set(audiences.map((a) => `${a.type}:${a.id}`))];
  const followers = new Map(keys.map((key) => [key, []]));
  for (const type of FOLLOW_TYPES) {
    const ids = audiences.filter((a) => a.type === type).map((a) => a.id);
    if (ids.length === 0) continue;
    const rows = await db
      .select({ personId: follows.personId, recordId: follows.recordId })
      .from(follows)
      .where(
        and(
          eq(follows.recordType, type),
          inArray(follows.recordId, [...new Set(ids)]),
          exceptId ? ne(follows.personId, exceptId) : undefined
        )
      );
    for (const row of rows) followers.get(`${type}:${row.recordId}`).push(row.personId);
  }
  return followers;
}

// Writes notices to the people they're for, once per person and message.
async function deliver(notices, audienceOf) {
  if (notices.length === 0) return 0;
  const names = Object.fromEntries(
    await Promise.all(
      ['game', 'organization', 'event', 'opportunity'].map(async (type) => [
        type,
        await recordsById(type, notices.map((notice) => notice.refs[type])),
      ])
    )
  );
  const rows = [];
  const seen = new Set();
  for (const notice of notices) {
    const text = describe(notice, names);
    if (!text) continue;
    for (const personId of audienceOf(notice)) {
      const key = `${personId}\n${text.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ personId, kind: notice.kind, data: text });
    }
  }
  // D1 takes so many values at a time.
  for (let i = 0; i < rows.length; i += 20) await db.insert(notifications).values(rows.slice(i, i + 20));
  return rows.length;
}

/**
 * Tells the followers of what a recorded change touches (see
 * utils/notifications), but its author. `change` as `noticesFor` takes it,
 * with `authorId`.
 */
export async function notifyFollowers(change) {
  const notices = noticesFor(change);
  if (notices.length === 0) return 0;
  const followers = await followersOf(
    notices.map((notice) => notice.audience),
    change.authorId
  );
  return deliver(notices, (notice) => followers.get(`${notice.audience.type}:${notice.audience.id}`) ?? []);
}

const HOUR = 3600000;
const DAY = 24 * HOUR;

/**
 * Reminds an event's followers and attendees a week and a day before it
 * starts: run every hour (workers/app.js), for the events starting in the
 * hour a week or a day from `now`.
 */
export async function sendEventReminders(now = new Date()) {
  let sent = 0;
  for (const [ahead, when] of [
    [7 * DAY, 'in a week'],
    [DAY, 'tomorrow'],
  ]) {
    const starting = await db
      .select()
      .from(events)
      .where(
        and(
          isNull(events.deletedAt),
          ne(events.status, 'canceled'),
          gte(events.startsAt, new Date(now.getTime() + ahead)),
          lt(events.startsAt, new Date(now.getTime() + ahead + HOUR))
        )
      );
    for (const event of starting) {
      const [followers, attendees] = await Promise.all([
        db.select({ personId: follows.personId }).from(follows).where(and(eq(follows.recordType, 'event'), eq(follows.recordId, event.id))),
        db.select({ personId: eventParticipants.personId }).from(eventParticipants).where(eq(eventParticipants.eventId, event.id)),
      ]);
      const people = [...new Set([...followers, ...attendees].map((row) => row.personId))];
      const rows = people.map((personId) => ({
        personId,
        kind: 'event_reminder',
        data: { message: `${event.name} starts ${when}`, path: eventPath(event) },
      }));
      for (let i = 0; i < rows.length; i += 20) await db.insert(notifications).values(rows.slice(i, i + 20));
      sent += rows.length;
    }
  }
  return sent;
}

// ---------------------------------------------------------------------------
// Reading them

/** How many notifications a person hasn't seen. */
export async function countUnread(personId) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.personId, personId), isNull(notifications.readAt)));
  return value;
}

/** A person's latest notifications: `{ id, kind, message, path, created_at, read }`. */
export async function listNotifications(personId, { limit = 100 } = {}) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.personId, personId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    message: row.data.message,
    path: row.data.path,
    created_at: row.createdAt,
    read: Boolean(row.readAt),
  }));
}

/** Marks all of a person's notifications as seen. */
export async function markAllRead(personId) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.personId, personId), isNull(notifications.readAt)));
}
