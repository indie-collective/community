// The weekly Bluesky summary (#319): what was added in the past week, posted
// once on Monday morning from the IC account.
import { and, asc, gte, isNull, lt } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { events, games, organizations } from '../db/schema.js';
import { announceOnBluesky } from '../utils/blueskyPost.server';
import { toOrigin } from '../utils/origin.server';
import { weekKey, weeklySummaryText } from '../utils/weeklySummary';
import { getValue, setValue } from './kv.server';

const WEEK = 7 * 86400000;

/** Names of the games, events and organisations added between two times, not deleted. */
export async function listAddedBetween(from, to) {
  const names = (table) =>
    db
      .select({ name: table.name })
      .from(table)
      .where(and(isNull(table.deletedAt), gte(table.createdAt, from), lt(table.createdAt, to)))
      .orderBy(asc(table.createdAt))
      .then((rows) => rows.map((row) => row.name));
  const [gameNames, eventNames, organizationNames] = await Promise.all([names(games), names(events), names(organizations)]);
  return { games: gameNames, events: eventNames, organizations: organizationNames };
}

// The list most of the week's additions are on.
const LISTS = { games: ['/games', 'New games'], events: ['/events', 'Upcoming events'], organizations: ['/orgs', 'New studios and associations'] };

// The site's address in posts: BASE_URL, or the one a request came on.
const siteOrigin = (origin) => origin ?? (toOrigin(process.env.BASE_URL) || 'https://community.indieco.xyz');

/**
 * The summary of the week before `now`: `{ text, url, title, description }`,
 * or null when nothing was added.
 */
export async function weeklySummary(now = new Date(), { origin } = {}) {
  const added = await listAddedBetween(new Date(now.getTime() - WEEK), now);
  const text = weeklySummaryText(added);
  if (!text) return null;
  const [most] = Object.keys(LISTS).sort((a, b) => added[b].length - added[a].length);
  const [path, title] = LISTS[most];
  return {
    text,
    url: `${siteOrigin(origin)}${path}`,
    title: `${title} on Indie Collective`,
    description: "This week's additions to the community's directory of indie games, studios, associations and events.",
  };
}

/**
 * Posts the week's summary, once a week (`force` posts again). Never throws;
 * skipped, with a warning, without the IC account (see blueskyPost.server).
 *
 * @returns {Promise<{ posted: boolean, text?: string }>}
 */
export async function postWeeklySummary({ now = new Date(), force = false, origin } = {}) {
  const key = `bluesky-weekly:${weekKey(now)}`;
  if (!force && (await getValue(key))) return { posted: false };
  const summary = await weeklySummary(now, { origin });
  // Done for the week either way: nothing to say is said.
  await setValue(key, summary ? 'posted' : 'nothing', { expiresAt: new Date(now.getTime() + 2 * WEEK) });
  if (!summary) return { posted: false };
  await announceOnBluesky(summary);
  return { posted: true, text: summary.text };
}
