// The open data exports (#304): every week, the current games,
// organisations, events and tags as CSV (zipped) and nested JSON, in the
// bucket under exports/, dated and as latest. See utils/openData for what's
// in them.
import { env } from 'cloudflare:workers';
import { asc, isNull } from 'drizzle-orm';

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
import { FILES, LICENCE, csv, readme } from '../utils/openData';
import { eventPath, gamePath, orgPath } from '../utils/slug';
import { zip } from '../utils/zip';
import { image } from './shapes.server';

const PREFIX = 'exports/';

const iso = (date) => (date ? new Date(date).toISOString() : null);
const imageUrl = (key, origin) => (key ? new URL(getImageLinks(image(key)).url, origin).href : null);

/** The export's records, as rows for the CSV files and nested for the JSON. */
async function records(origin) {
  const live = (table) => db.select().from(table).where(isNull(table.deletedAt)).orderBy(asc(table.createdAt));
  const [gameRows, orgRows, eventRows, tagRows, credits, tagged, shown, hosted, milestones] = await Promise.all([
    live(games),
    live(organizations),
    live(events),
    db.select().from(tags).orderBy(asc(tags.name)),
    db.select().from(gameOrganizations),
    db.select().from(gameTags),
    db.select().from(gameEvents),
    db.select().from(organizationEvents),
    db.select().from(gameMilestones).orderBy(asc(gameMilestones.date)),
  ]);
  const ids = (rows) => new Set(rows.map((row) => row.id));
  const [gameIds, orgIds, eventIds] = [ids(gameRows), ids(orgRows), ids(eventRows)];
  // Links only between records that are in the export.
  const links = {
    game_organizations: credits.filter((l) => gameIds.has(l.gameId) && orgIds.has(l.organizationId)),
    game_tags: tagged.filter((l) => gameIds.has(l.gameId)),
    game_events: shown.filter((l) => gameIds.has(l.gameId) && eventIds.has(l.eventId)),
    organization_events: hosted.filter((l) => orgIds.has(l.organizationId) && eventIds.has(l.eventId)),
    game_milestones: milestones.filter((m) => gameIds.has(m.gameId)),
  };
  const times = (row) => ({ created_at: iso(row.createdAt), updated_at: iso(row.updatedAt) });
  const place = (row) => ({
    country_code: row.countryCode,
    region: row.region,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
  });
  return {
    'games.csv': gameRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      url: `${origin}${gamePath(row)}`,
      name: row.name,
      about: row.about,
      site: row.site,
      igdb_slug: row.igdbSlug,
      ...times(row),
    })),
    'organizations.csv': orgRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      url: `${origin}${orgPath(row)}`,
      type: row.type,
      status: row.status,
      name: row.name,
      about: row.about,
      site: row.site,
      bsky_handle: row.bskyHandle,
      ...place(row),
      logo_url: imageUrl(row.logoKey, origin),
      ...times(row),
    })),
    'events.csv': eventRows.map((row) => ({
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
      street: row.street,
      ...place(row),
      cover_url: imageUrl(row.coverKey, origin),
      previous_edition_id: eventIds.has(row.previousEditionId) ? row.previousEditionId : null,
      ...times(row),
    })),
    'tags.csv': tagRows.map((row) => ({ id: row.id, name: row.name })),
    'game_organizations.csv': links.game_organizations.map((l) => ({ game_id: l.gameId, organization_id: l.organizationId, role: l.role })),
    'game_tags.csv': links.game_tags.map((l) => ({ game_id: l.gameId, tag_id: l.tagId })),
    'game_events.csv': links.game_events.map((l) => ({ game_id: l.gameId, event_id: l.eventId })),
    'organization_events.csv': links.organization_events.map((l) => ({ organization_id: l.organizationId, event_id: l.eventId })),
    'game_milestones.csv': links.game_milestones.map((m) => ({
      game_id: m.gameId,
      kind: m.kind,
      date: iso(m.date)?.slice(0, 10),
      date_precision: m.datePrecision,
      note: m.note,
    })),
  };
}

// The same records nested, for developers.
function nested(rows, date) {
  const by = (list, key) => list.reduce((map, row) => map.set(row[key], [...(map.get(row[key]) ?? []), row]), new Map());
  const tagNames = new Map(rows['tags.csv'].map((tag) => [tag.id, tag.name]));
  const credits = by(rows['game_organizations.csv'], 'game_id');
  const gameTagsBy = by(rows['game_tags.csv'], 'game_id');
  const shownBy = by(rows['game_events.csv'], 'game_id');
  const steps = by(rows['game_milestones.csv'], 'game_id');
  const hostsBy = by(rows['organization_events.csv'], 'event_id');
  const gamesAt = by(rows['game_events.csv'], 'event_id');
  return {
    licence: LICENCE,
    generated_at: date,
    games: rows['games.csv'].map((game) => ({
      ...game,
      organizations: (credits.get(game.id) ?? []).map(({ organization_id: id, role }) => ({ id, role })),
      tags: (gameTagsBy.get(game.id) ?? []).map(({ tag_id: id }) => tagNames.get(id)),
      events: (shownBy.get(game.id) ?? []).map(({ event_id: id }) => id),
      milestones: (steps.get(game.id) ?? []).map(({ game_id: _game, ...step }) => step),
    })),
    organizations: rows['organizations.csv'],
    events: rows['events.csv'].map((event) => ({
      ...event,
      organizations: (hostsBy.get(event.id) ?? []).map(({ organization_id: id }) => id),
      games: (gamesAt.get(event.id) ?? []).map(({ game_id: id }) => id),
    })),
  };
}

/**
 * Builds this week's export and stores it in the bucket: dated, and as
 * latest. `origin` is the site's, for record and image URLs.
 *
 * @returns {Promise<{ date: string, files: string[] }>}
 */
export async function publishExport({ origin, now = new Date() } = {}) {
  const date = now.toISOString().slice(0, 10);
  const rows = await records(origin);
  const json = JSON.stringify(nested(rows, date), null, 2);
  const files = {
    'README.txt': readme(date),
    ...Object.fromEntries(FILES.map(([file, , columns]) => [file, csv(rows[file], columns)])),
    'community.json': json,
  };
  const archive = zip(files, now);
  const put = (key, body, type) =>
    env.IMAGES.put(`${PREFIX}${key}`, body, {
      httpMetadata: {
        contentType: type,
        contentDisposition: `attachment; filename="${key.replace('latest', `community-${date}`)}"`,
      },
    });
  await Promise.all([
    put(`community-${date}.zip`, archive, 'application/zip'),
    put(`community-${date}.json`, json, 'application/json'),
    put('latest.zip', archive, 'application/zip'),
    put('latest.json', json, 'application/json'),
  ]);
  return { date, files: Object.keys(files) };
}

/** The exports in the bucket, newest first: `{ name, size, uploaded }`. */
export async function listExports() {
  const listed = await env.IMAGES.list({ prefix: PREFIX });
  return listed.objects
    .map((object) => ({ name: object.key.slice(PREFIX.length), size: object.size, uploaded: object.uploaded }))
    .filter((object) => /^community-\d{4}-\d{2}-\d{2}\.(zip|json)$/.test(object.name))
    .sort((a, b) => b.name.localeCompare(a.name));
}

/** One export file, as a Response, or null. */
export async function exportFile(name) {
  if (!/^(latest|community-\d{4}-\d{2}-\d{2})\.(zip|json)$/.test(name)) return null;
  const object = await env.IMAGES.get(`${PREFIX}${name}`);
  if (!object) return null;
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(object.body, { headers });
}
