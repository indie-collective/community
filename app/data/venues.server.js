// Venues (#390): named places events are held at. The only place that knows
// how they're stored; an event keeps its own copy of its venue's location
// (see venueLinks.server), so everything that reads places works unchanged.
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { venues } from '../db/schema.js';
import { normalizeSearch } from '../db/searchText.js';
import { matchesSearch } from '../db/search.js';
import { slugify } from '../utils/slug';
import { recordChange } from './changes.server';
import { searchIndex } from './search.server';
import * as shape from './shapes.server';
import { freeSlug, renameSlugStatements } from './slugs.server';
import { upcomingEventStatements } from './venueLinks.server';

const notDeleted = isNull(venues.deletedAt);

/** A venue, or null when there's none or it's deleted. */
export async function getVenue(id) {
  const [row] = await db
    .select()
    .from(venues)
    .where(and(eq(venues.id, id), notDeleted));
  return row ? shape.venue(row) : null;
}

/** Venues as cards, in the order of `ids` (search results). */
export async function listVenueCards(ids) {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(venues)
    .where(and(notDeleted, inArray(venues.id, ids)));
  const byId = new Map(rows.map((row) => [row.id, shape.venue(row)]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/** Venues matching what someone typed, for the event form's place field. */
export async function searchVenues(q, { limit = 5 } = {}) {
  const found = await searchIndex(q, { kinds: ['venue'], limit });
  return found ? listVenueCards(found.hits.map((hit) => hit.id)) : [];
}

/** A country's venues, by name. */
export async function listVenuesIn(countryCode) {
  const rows = await db
    .select()
    .from(venues)
    .where(and(notDeleted, eq(venues.countryCode, countryCode)))
    .orderBy(asc(venues.name));
  return rows.map(shape.venue);
}

/**
 * The venue called `name` (ignoring case and accents) in that city and
 * country, as far as they're known, or null. With neither known, only when
 * one venue has the name: it can't be told which is meant otherwise.
 */
export async function findVenueNamed(name, { city = null, countryCode = null } = {}) {
  const search = matchesSearch(venues.searchText, name);
  if (!search) return null;
  const rows = await db
    .select()
    .from(venues)
    .where(and(notDeleted, search));
  const wanted = normalizeSearch(name);
  const same = (a, b) => !a || !b || normalizeSearch(a) === normalizeSearch(b);
  const found = rows.filter(
    (row) =>
      normalizeSearch(row.name) === wanted &&
      same(row.city, city) &&
      same(row.countryCode, countryCode)
  );
  if (!city && !countryCode && found.length > 1) return null;
  return found[0] ? shape.venue(found[0]) : null;
}

/**
 * Creates a venue. `location` holds street, city, region, country_code,
 * latitude, longitude.
 * @returns {Promise<object>} the venue
 */
export async function createVenue({ name, about = null, site = null, location, authorId = null }) {
  const id = crypto.randomUUID();
  const slug = await freeSlug('venue', slugify(name));
  await recordChange({
    operation: 'create',
    kind: 'venue',
    recordId: id,
    authorId,
    statements: [
      db.insert(venues).values({
        id,
        name,
        slug,
        about,
        site,
        ...shape.locationColumns(location),
        searchText: shape.searchTextOf({ name, about }),
        lastModifiedById: authorId,
      }),
    ],
  });
  return getVenue(id);
}

/**
 * Updates a venue, and its upcoming events if its location changes.
 * Undefined fields and an empty location keep the current value.
 * @returns {Promise<{ id: string, slug: string }>}
 */
export async function updateVenue(id, { name, about, site, location, authorId }) {
  const [current] = await db.select().from(venues).where(eq(venues.id, id));
  const place = shape.locationColumns(location);
  const slug = await freeSlug('venue', slugify(name ?? current.name), { recordId: id });
  await recordChange({
    operation: 'update',
    kind: 'venue',
    recordId: id,
    authorId,
    statements: [
      db
        .update(venues)
        .set({
          name,
          about,
          site,
          ...place,
          searchText: shape.searchTextOf({
            name: name ?? current.name,
            about: about === undefined ? current.about : about,
          }),
          lastModifiedById: authorId,
        })
        .where(eq(venues.id, id)),
      ...renameSlugStatements('venue', id, current.slug, slug),
      ...(place ? await upcomingEventStatements(id, current, place, { authorId }) : []),
    ],
  });
  return { id, slug };
}

/**
 * What an event form's place field chose: `venueId` (a venue picked, or
 * empty for none; undefined when the form didn't say) or `venueName` (one to
 * name, found or added now). Returns the event's `venueId` (undefined keeps
 * it) and `location`: a newly chosen venue's, otherwise as submitted, so a
 * past event saved with its venue unchanged keeps the address it was held at.
 *
 * `event` is the event being edited, as its edit form reads it.
 */
export async function resolveEventVenue({ venueId, venueName, location, attendance, event = null, authorId = null }) {
  if (attendance === 'online') return { venueId: null, location };
  const name = venueName?.trim();
  if (!venueId && name) {
    // Named on the form without a new place: where the event already is.
    const place = shape.locationColumns(location) ? location : event?.location;
    const venue =
      (await findVenueNamed(name, { city: place?.city, countryCode: place?.country_code })) ??
      (await createVenue({ name, location: place, authorId }));
    return { venueId: venue.id, location: venue.location ?? location };
  }
  if (!venueId) return { venueId: venueId === undefined ? undefined : null, location };
  if (venueId === event?.venue?.id) return { venueId, location };
  const venue = await getVenue(venueId);
  if (!venue) return { venueId: null, location };
  return { venueId, location: venue.location ?? location };
}
