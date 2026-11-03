import { eq, inArray } from 'drizzle-orm';

import { db, events, idFromPath, retryBusy, searchText, setFlag, venues } from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';
import { eventSlug, slugify } from '../app/utils/slug.js';

// #390: named, reusable places for events.

const DAY = 86400000;

// Mapbox's answer: a place of interest and a plain address.
const POI = (name) => ({
  id: 'poi.1',
  place_type: ['poi'],
  text: name,
  place_name: `${name}, 4 Cours des Alliés, Rennes, France`,
  properties: { address: '4 Cours des Alliés' },
  geometry: { type: 'Point', coordinates: [-1.676, 48.105] },
  context: [
    { id: 'place.1', text: 'Rennes' },
    { id: 'region.1', text: 'Ille-et-Vilaine', short_code: 'FR-35' },
    { id: 'country.1', text: 'France', short_code: 'fr' },
  ],
});
const ADDRESS = {
  id: 'address.1',
  place_type: ['address'],
  text: 'Rue de la Paix',
  address: '12',
  place_name: '12 Rue de la Paix, Rennes, France',
  properties: {},
  geometry: { type: 'Point', coordinates: [-1.68, 48.11] },
  context: POI('x').context,
};
const mockMapbox = (page, features) =>
  page.route('https://api.mapbox.com/geocoding/**', (route) =>
    route.fulfill({ json: { type: 'FeatureCollection', features } })
  );

const unique = () => Date.now() % 1000000;

async function fillEvent(page, name) {
  await page.goto('/events/create');
  await waitForHydration(page);
  await page.getByLabel(/^name/i).fill(name);
  await page.getByLabel(/^start\*?$/i).fill('2031-05-01T18:00');
  await page.getByLabel(/^end\*?$/i).fill('2031-05-01T22:00');
}

const pick = async (page, text, option) => {
  await page.getByRole('textbox', { name: 'Location' }).fill(text);
  await page.getByRole('button', { name: option }).click();
};

const save = async (page, name) => {
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
  return (await db.select().from(events).where(eq(events.id, await idFromPath(new URL(page.url()).pathname))))[0];
};

async function insertVenue(name, values = {}) {
  const [venue] = await retryBusy(() =>
    db
      .insert(venues)
      .values({ name, slug: slugify(name), searchText: searchText(name), ...values })
      .returning()
  );
  return venue;
}

async function insertEvent(name, startsAt, values = {}) {
  const [event] = await retryBusy(() =>
    db
      .insert(events)
      .values({
        name,
        slug: eventSlug(name, startsAt),
        searchText: searchText(name),
        startsAt,
        endsAt: new Date(startsAt.getTime() + 3600000),
        ...values,
      })
      .returning()
  );
  return event;
}

async function cleanUp(eventIds, venueIds) {
  await retryBusy(() => db.delete(events).where(inArray(events.id, eventIds)));
  await retryBusy(() => db.delete(venues).where(inArray(venues.id, venueIds)));
}

test('a place of interest becomes a venue, which the next event reuses', async ({ page }) => {
  const id = unique();
  const venueName = `Halle ${id}`;
  await mockMapbox(page, [POI(venueName)]);
  await signIn(page, MEMBER);

  await fillEvent(page, `First At Halle ${id}`);
  await pick(page, 'Halle', POI(venueName).place_name);
  await expect(page.getByLabel('Venue name')).toHaveValue(venueName);
  const first = await save(page, `First At Halle ${id}`);

  const [venue] = await db.select().from(venues).where(eq(venues.name, venueName));
  try {
    expect(venue).toMatchObject({ street: '4 Cours des Alliés', city: 'Rennes', countryCode: 'FR' });
    expect(first).toMatchObject({ venueId: venue.id, street: '4 Cours des Alliés', city: 'Rennes', timeZone: 'Europe/Paris' });
    await expect(page.getByRole('link', { name: venueName, exact: true })).toBeVisible();

    // No more Mapbox results: the venue itself is what's suggested.
    await page.unroute('https://api.mapbox.com/geocoding/**');
    await mockMapbox(page, []);
    await fillEvent(page, `Second At Halle ${id}`);
    await pick(page, venueName, new RegExp(`^${venueName}, 4 Cours`));
    await expect(page.getByTestId('event-venue')).toContainText(venueName);
    const second = await save(page, `Second At Halle ${id}`);
    expect(second).toMatchObject({ venueId: venue.id, city: 'Rennes', latitude: venue.latitude });
    expect(await db.select().from(venues).where(eq(venues.name, venueName))).toHaveLength(1);

    await page.getByRole('link', { name: venueName, exact: true }).click();
    await expect(page.getByRole('heading', { name: venueName, level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: `First At Halle ${id}` })).toBeVisible();
    await expect(page.getByRole('link', { name: `Second At Halle ${id}` })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/venue/${slugify(venueName)}$`));
    expect(await page.request.get('/sitemap.xml').then((r) => r.text())).toContain(`/venue/${venue.slug}`);
  } finally {
    await cleanUp(
      (await db.select({ id: events.id }).from(events).where(eq(events.venueId, venue.id))).map((e) => e.id),
      [venue.id]
    );
  }
});

test('a plain address still works and adds no venue; an online event has none', async ({ page }) => {
  const id = unique();
  await mockMapbox(page, [ADDRESS]);
  await signIn(page, MEMBER);
  await fillEvent(page, `At An Address ${id}`);
  await pick(page, 'Rue de la Paix', ADDRESS.place_name);
  await expect(page.getByLabel('Venue name')).toHaveValue('');
  const event = await save(page, `At An Address ${id}`);
  try {
    expect(event).toMatchObject({ venueId: null, street: '12 Rue de la Paix', city: 'Rennes' });
    await expect(page.getByRole('link', { name: /\/venue\// })).toHaveCount(0);
  } finally {
    await cleanUp([event.id], []);
  }

  // Going online drops the venue with the place.
  const venue = await insertVenue(`Online Drop ${id}`, { city: 'Rennes', countryCode: 'FR' });
  const held = await insertEvent(`Went Online ${id}`, new Date(Date.now() + 5 * DAY), {
    venueId: venue.id,
    city: 'Rennes',
    countryCode: 'FR',
  });
  try {
    await page.goto(`/event/${held.slug}/edit`);
    await waitForHydration(page);
    await expect(page.getByTestId('event-venue')).toContainText(venue.name);
    await page.getByLabel('Where').selectOption('online');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByRole('heading', { name: held.name, level: 1 })).toBeVisible();
    const [saved] = await db.select().from(events).where(eq(events.id, held.id));
    expect(saved).toMatchObject({ venueId: null, attendance: 'online', city: null });
  } finally {
    await cleanUp([held.id], [venue.id]);
  }
});

test('saving a past event with its venue unchanged keeps the address it was held at', async ({ page }) => {
  const id = unique();
  const venue = await insertVenue(`Moved Hall ${id}`, { street: 'New Street', city: 'Rennes', countryCode: 'FR', latitude: 48.1, longitude: -1.6 });
  const past = await insertEvent(`Long Ago ${id}`, new Date(Date.now() - 30 * DAY), {
    venueId: venue.id,
    street: 'Old Street',
    city: 'Rennes',
    countryCode: 'FR',
    latitude: 48.2,
    longitude: -1.7,
  });
  try {
    await signIn(page, MEMBER);
    await page.goto(`/event/${past.slug}/edit`);
    await waitForHydration(page);
    await page.getByLabel(/^name/i).fill(`Long Ago Renamed ${id}`);
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByRole('heading', { name: `Long Ago Renamed ${id}`, level: 1 })).toBeVisible();
    const [saved] = await db.select().from(events).where(eq(events.id, past.id));
    expect(saved).toMatchObject({ venueId: venue.id, street: 'Old Street', latitude: 48.2 });
  } finally {
    await cleanUp([past.id], [venue.id]);
  }
});

test('moving a venue moves its upcoming events, not its past ones, and undoing moves them back', async ({ newPage }) => {
  const id = unique();
  const name = `Moving Hall ${id}`;
  const venue = await insertVenue(name, {
    street: '1 Old Road',
    city: 'Paris',
    region: 'Paris',
    countryCode: 'FR',
    latitude: 48.85,
    longitude: 2.35,
  });
  const place = { street: '1 Old Road', city: 'Paris', region: 'Paris', countryCode: 'FR', latitude: 48.85, longitude: 2.35 };
  // 20:00 in Paris, in June.
  const startsAt = new Date('2031-06-10T18:00:00Z');
  const coming = await insertEvent(`Coming ${id}`, startsAt, { venueId: venue.id, timeZone: 'Europe/Paris', ...place });
  const gone = await insertEvent(`Gone ${id}`, new Date(Date.now() - 30 * DAY), { venueId: venue.id, timeZone: 'Europe/Paris', ...place });
  const read = async (event) => (await retryBusy(() => db.select().from(events).where(eq(events.id, event.id))))[0];
  try {
    const member = await newPage();
    const kyoto = {
      id: 'place.2',
      place_type: ['place'],
      text: 'Kyoto',
      place_name: 'Kyoto, Japan',
      properties: {},
      geometry: { type: 'Point', coordinates: [135.77, 35.01] },
      context: [
        { id: 'region.2', text: 'Kyoto', short_code: 'JP-26' },
        { id: 'country.2', text: 'Japan', short_code: 'jp' },
      ],
    };
    await mockMapbox(member, [kyoto]);
    await signIn(member, MEMBER);
    await member.goto(`/venue/${venue.slug}/edit`);
    await waitForHydration(member);
    await member.getByRole('textbox', { name: 'Location' }).fill('Kyoto');
    await member.getByRole('button', { name: 'Kyoto, Japan' }).click();
    await member.getByRole('button', { name: /submit/i }).click();
    await expect(member.getByRole('heading', { name, level: 1 })).toBeVisible();

    const moved = await read(coming);
    expect(moved).toMatchObject({ city: 'Kyoto', countryCode: 'JP', timeZone: 'Asia/Tokyo' });
    // Still 20:00 where it happens.
    expect(moved.startsAt.toISOString()).toBe('2031-06-10T11:00:00.000Z');
    expect(await read(gone)).toMatchObject({ city: 'Paris', timeZone: 'Europe/Paris' });

    const admin = await newPage();
    await signIn(admin, ADMIN);
    await admin.goto('/admin/changes');
    await waitForHydration(admin);
    await admin.getByRole('button', { name: `Undo: Changed ${name}` }).first().click();
    await expect(admin.getByTestId('moderation-result')).toHaveText('Undone.');
    await expect.poll(async () => (await read(coming)).city).toBe('Paris');
    const back = await read(coming);
    expect(back).toMatchObject({ timeZone: 'Europe/Paris', street: '1 Old Road' });
    expect(back.startsAt.toISOString()).toBe(startsAt.toISOString());
  } finally {
    await cleanUp([coming.id, gone.id], [venue.id]);
  }
});

test('venues are found in search, and events by their venue; calendars name it', async ({ page }) => {
  const id = unique();
  const name = `Zeppelinhalle${id}`;
  const venue = await insertVenue(name, { street: '9 Dock', city: 'Hamburg', countryCode: 'DE', latitude: 53.5, longitude: 10 });
  const event = await insertEvent(`Harbour Jam ${id}`, new Date(Date.now() + 5 * DAY), {
    venueId: venue.id,
    street: '9 Dock',
    city: 'Hamburg',
    countryCode: 'DE',
    latitude: 53.5,
    longitude: 10,
  });
  try {
    await page.goto(`/search?q=${name}`);
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: event.name })).toBeVisible();

    await page.goto('/country/de');
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();

    await page.goto(`/event/${event.slug}`);
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();

    const ics = await (await page.request.get(`/event/${event.slug}/calendar.ics`)).text();
    expect(ics.replace(/\r\n /g, '')).toContain(`LOCATION:${name}\\, 9 Dock\\, Hamburg`);

    // Deleted, it's gone from the event, which keeps its address.
    await retryBusy(() => db.update(venues).set({ deletedAt: new Date() }).where(eq(venues.id, venue.id)));
    await page.goto(`/event/${event.slug}`);
    await expect(page.getByText('9 Dock, Hamburg', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name, exact: true })).toHaveCount(0);
    expect((await page.request.get(`/venue/${venue.slug}`)).status()).toBe(404);
  } finally {
    await cleanUp([event.id], [venue.id]);
  }
});

test('a venue set aside on the form leaves its address, without the venue', async ({ page }) => {
  const id = unique();
  const name = `Set Aside Hall ${id}`;
  const venue = await insertVenue(name, { street: '3 Quay', city: 'Rennes', region: 'Bretagne', countryCode: 'FR', latitude: 48.1, longitude: -1.6 });
  await mockMapbox(page, []);
  await signIn(page, MEMBER);
  await fillEvent(page, `Not There ${id}`);
  await pick(page, name, new RegExp(`^${name}, 3 Quay`));
  await page.getByRole('button', { name: 'Not a venue' }).click();
  await expect(page.getByTestId('event-venue')).toHaveCount(0);
  const event = await save(page, `Not There ${id}`);
  try {
    expect(event).toMatchObject({ venueId: null, street: '3 Quay', city: 'Rennes', countryCode: 'FR', latitude: 48.1 });
  } finally {
    await cleanUp([event.id], [venue.id]);
  }
});

test('the API gives an event its venue', async ({ request }) => {
  const id = unique();
  await setFlag('api', 'on');
  const venue = await insertVenue(`Api Hall ${id}`, { city: 'Lyon', countryCode: 'FR' });
  const event = await insertEvent(`Api Hall Jam ${id}`, new Date(Date.now() + 5 * DAY), { venueId: venue.id, city: 'Lyon', countryCode: 'FR' });
  try {
    const { data } = await (await request.get(`/api/v1/events/${event.slug}`)).json();
    expect(data.venue).toMatchObject({ id: venue.id, name: venue.name, url: expect.stringMatching(new RegExp(`/venue/${venue.slug}$`)) });
    const list = await (await request.get('/api/v1/events?country=FR&limit=100')).json();
    expect(list.data.find((e) => e.id === event.id).venue.name).toBe(venue.name);
  } finally {
    await setFlag('api', null);
    await cleanUp([event.id], [venue.id]);
  }
});
