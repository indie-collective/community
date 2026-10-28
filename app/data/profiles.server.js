// Public profile pages (#341): what a member shows others, never their
// email, Discord or sign-in identities.
import { and, count, desc, eq, gte, inArray, isNull, lt, ne } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { changes, eventParticipants, events, games, organizations, people } from '../db/schema.js';
import getImageLinks from '../utils/imageLinks.server';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import * as shape from './shapes.server';

const RECORDS = {
  games: { table: games, path: gamePath, kind: 'game' },
  organizations: { table: organizations, path: orgPath, kind: 'organization' },
  events: { table: events, path: eventPath, kind: 'event' },
};

/** A member's events, upcoming soonest first, then past ones latest first. */
async function attendedEvents(personId) {
  const now = new Date();
  const going = (when, order) =>
    db
      .select()
      .from(events)
      .innerJoin(eventParticipants, eq(eventParticipants.eventId, events.id))
      .where(and(eq(eventParticipants.personId, personId), isNull(events.deletedAt), when))
      .orderBy(order)
      .limit(12);
  const [upcoming, past] = await Promise.all([
    going(gte(events.endsAt, now), events.startsAt),
    going(lt(events.endsAt, now), desc(events.startsAt)),
  ]);
  const card = ({ events: row }) => {
    const event = shape.event(row);
    return { ...event, cover: event.cover ? getImageLinks(event.cover) : null };
  };
  return { upcoming: upcoming.map(card), past: past.map(card) };
}

/** How many records a member added and edited, and their latest changes. */
async function contributions(personId) {
  const [totals, latest] = await Promise.all([
    db
      .select({ operation: changes.operation, value: count() })
      .from(changes)
      .where(eq(changes.authorId, personId))
      .groupBy(changes.operation),
    db
      .select({
        id: changes.id,
        operation: changes.operation,
        tableName: changes.tableName,
        recordId: changes.recordId,
        createdAt: changes.createdAt,
      })
      .from(changes)
      .where(and(eq(changes.authorId, personId), ne(changes.operation, 'delete')))
      .orderBy(desc(changes.createdAt))
      .limit(10),
  ]);

  // The records' current names and addresses; deleted ones are left out.
  const names = new Map();
  await Promise.all(
    Object.entries(RECORDS).map(async ([tableName, { table, path }]) => {
      const ids = latest.filter((c) => c.tableName === tableName).map((c) => c.recordId);
      if (ids.length === 0) return;
      const rows = await db
        .select({ id: table.id, slug: table.slug, name: table.name })
        .from(table)
        .where(and(inArray(table.id, ids), isNull(table.deletedAt)));
      for (const row of rows) names.set(row.id, { name: row.name, path: path(row) });
    })
  );

  const total = (operation) => totals.find((t) => t.operation === operation)?.value ?? 0;
  return {
    added: total('create'),
    edited: total('update'),
    latest: latest
      .filter((change) => names.has(change.recordId))
      .map((change) => ({
        id: change.id,
        operation: change.operation,
        kind: RECORDS[change.tableName].kind,
        created_at: change.createdAt,
        ...names.get(change.recordId),
      })),
  };
}

/**
 * A member's public profile by username, or null when there's no such
 * member, they hid it, or they're restricted. `viewerId` sees their own
 * hidden profile.
 */
export async function getPublicProfile(username, { viewerId } = {}) {
  const row = await db.query.people.findFirst({ where: eq(people.username, username) });
  if (!row || row.role === 'restricted') return null;
  const own = viewerId === row.id;
  if (row.profileHidden && !own) return null;
  const [attending, contributed] = await Promise.all([attendedEvents(row.id), contributions(row.id)]);
  return {
    username: row.username,
    // First name only: the last name stays private, as everywhere.
    first_name: row.firstName,
    about: row.about,
    bsky_handle: row.bskyHandle,
    avatar: row.avatarKey
      ? getImageLinks(shape.image(row.avatarKey))
      : row.avatarUrl
        ? { url: row.avatarUrl, thumbnail_url: row.avatarUrl }
        : null,
    since: row.createdAt,
    hidden: row.profileHidden,
    own,
    attending,
    contributions: contributed,
  };
}

/** Usernames of public profiles, for the sitemap. */
export async function listPublicUsernames() {
  const rows = await db
    .select({ username: people.username })
    .from(people)
    .where(and(eq(people.profileHidden, false), ne(people.role, 'restricted')));
  return rows.map((row) => row.username);
}
