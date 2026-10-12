import { and, eq, isNotNull } from 'drizzle-orm';

import {
  db,
  eventParticipants,
  events,
  idFromPath,
  people,
  searchText,
} from './db.js';
import { expect, test, MEMBER, signIn } from './helpers';
import { eventSlug } from '../app/utils/slug.js';

// A new event tomorrow, in the same place as a seeded one.
async function createEvent(name, startsAt = new Date(Date.now() + 86400000)) {
  const [placed] = await db
    .select()
    .from(events)
    .where(isNotNull(events.countryCode))
    .limit(1);
  const [event] = await db
    .insert(events)
    .values({
      name,
      // As the app would give it (#209).
      slug: eventSlug(name, startsAt),
      searchText: searchText(name),
      startsAt,
      endsAt: new Date(startsAt.getTime() + 86400000),
      countryCode: placed.countryCode,
      city: placed.city,
      latitude: placed.latitude,
      longitude: placed.longitude,
    })
    .returning();
  return event;
}
const deleteEvent = (id) => db.delete(events).where(eq(events.id, id));
const findEvent = async (id) =>
  (await db.select().from(events).where(eq(events.id, id)))[0];

// #172: a dialog opened over the event page for signed-in users and blocked
// every control, including joining.
test('a member can join and leave an upcoming event', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/events');
  await page.locator('a[href^="/event/"]').first().click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Past events say "I went!" / "Went" instead.
  const join = page.getByRole('button', { name: /^(let's go!|i went!)$/i });
  const going = page.getByRole('button', { name: /^(going|went)$/i });
  if (await going.isVisible()) {
    await going.click();
    await expect(join).toBeVisible();
  }
  await join.click();
  await expect(going).toBeVisible();
  await going.click();
  await expect(join).toBeVisible();
});

// #194: the event page rendered src={cover && cover.url}, an <img> with no
// source, for events without a cover.
test('an event without a cover shows the placeholder', async ({ page }) => {
  const event = await createEvent(`No Cover ${Date.now() % 100000}`);

  try {
    const response = await page.goto(`/event/${event.id}`);
    expect(response.status()).toBe(200);
    // Decorative (alt=""): the page's first image.
    const cover = page.locator('main img').first();
    await expect(cover).toHaveAttribute('src', /placeholder/);
    expect(
      await cover.evaluate((img) => img.complete && img.naturalWidth > 0)
    ).toBe(true);
  } finally {
    await deleteEvent(event.id);
  }
});

// Attendee avatars were raw image rows without thumbnail_url, so every
// attendee showed their initial instead of their picture.
test('event attendees show their avatar', async ({ page }) => {
  const [member] = await db
    .select()
    .from(people)
    .where(eq(people.email, MEMBER));
  const [event] = await db
    .select()
    .from(events)
    .where(and(isNotNull(events.coverKey), isNotNull(events.countryCode)))
    .limit(1);
  const url = 'https://cdn.example.test/avatar-check.png';
  await db
    .update(people)
    .set({ avatarKey: url })
    .where(eq(people.id, member.id));
  await db
    .insert(eventParticipants)
    .values({ eventId: event.id, personId: member.id })
    .onConflictDoNothing();

  try {
    await page.goto(`/event/${event.id}`);
    await expect(
      page.locator(`[title="@${member.username}"] img`)
    ).toHaveAttribute('src', url);
  } finally {
    await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, event.id),
          eq(eventParticipants.personId, member.id)
        )
      );
    await db
      .update(people)
      .set({ avatarKey: member.avatarKey })
      .where(eq(people.id, member.id));
  }
});

// #208: the location picker didn't ask Mapbox for a language, so places
// were saved under their local names ("Warszawa").
test('the location picker asks for English place names', async ({ page }) => {
  const requests = [];
  await page.route('https://api.mapbox.com/geocoding/**', (route) => {
    requests.push(new URL(route.request().url()));
    route.fulfill({ json: { type: 'FeatureCollection', features: [] } });
  });

  await signIn(page, MEMBER);
  await page.goto('/events/create');
  await page.getByRole('textbox', { name: 'Location' }).fill('Warszawa');

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  expect(requests.at(-1).searchParams.get('language')).toBe('en');
});

// #204: event times are shown and entered in the event's own time zone, with
// the same text on the server (UTC here) and in the browser (Tokyo here).
test.describe('event times', () => {
  test.use({ timezoneId: 'Asia/Tokyo' });

  const rennes = {
    street: '4bis Cours des Alliés',
    city: 'Rennes',
    region: 'Ille-et-Vilaine',
    country_code: 'FR',
    latitude: '48.10506',
    longitude: '-1.676466',
  };
  const kyoto = {
    street: '',
    city: 'Kyoto',
    region: 'Kyoto',
    country_code: 'JP',
    latitude: '35.0116',
    longitude: '135.7681',
  };

  async function postEvent(page, location, start, end) {
    const response = await page.request.post('/events/create', {
      multipart: {
        name: `Time Zone ${Date.now() % 100000}`,
        start,
        end,
        about: '',
        site: '',
        ...location,
      },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    return response.headers().location;
  }

  test('a Rennes event keeps its local time through an unchanged edit', async ({
    page,
  }) => {
    await signIn(page, MEMBER);
    const path = await postEvent(
      page,
      rennes,
      '2026-11-20T14:00',
      '2026-11-22T19:30'
    );
    const id = await idFromPath(path);
    try {
      expect((await findEvent(id)).timeZone).toBe('Europe/Paris');

      await page.goto(`${path}/edit`);
      await expect(page.getByLabel(/start/i)).toHaveValue('2026-11-20T14:00');
      await page.getByRole('button', { name: /submit|save/i }).click();
      await expect(page).toHaveURL(path);

      const event = await findEvent(id);
      expect(event.startsAt.toISOString()).toBe('2026-11-20T13:00:00.000Z');
      expect(event.endsAt.toISOString()).toBe('2026-11-22T18:30:00.000Z');
      await expect(page.locator('main time').first()).toHaveText(
        /^NOV 20, 14:00 – NOV 22, 19:30$/i
      );
    } finally {
      await deleteEvent(id);
    }
  });

  test('a Kyoto event shows Kyoto time, the same before and after hydration', async ({
    page,
  }) => {
    await signIn(page, MEMBER);
    const path = await postEvent(
      page,
      kyoto,
      '2026-12-05T19:00',
      '2026-12-05T22:00'
    );
    const id = await idFromPath(path);
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text()))
        errors.push(message.text().split('\n')[0]);
    });
    try {
      const html = await (await page.request.get(path)).text();
      expect(html).toContain('Dec 5, 19:00 – 22:00');

      await page.goto(path);
      await expect(page.locator('main time').first()).toHaveText(
        /^DEC 5, 19:00 – 22:00$/i
      );
      expect(errors).toEqual([]);
    } finally {
      await deleteEvent(id);
    }
  });
});

test.describe('event lists in another time zone', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });

  // Cards formatted times in the viewer's zone (and stringified Dates in
  // <time dateTime>), so a visitor elsewhere saw other times than the server.
  test('event cards show the same times in any browser time zone', async ({
    page,
  }) => {
    const html = await (await page.request.get('/events')).text();
    const [, serverText] = html.match(/<time[^>]*>([^<]+)<\/time>/);

    await page.goto('/events', { waitUntil: 'networkidle' });
    const first = page.locator('main time').first();
    await expect(first).toHaveText(serverText);
    expect(await first.getAttribute('datetime')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });
});

// #198: "Related events" only appears when there are some.
test('an event with no related events has no empty "Related events" section', async ({
  page,
}) => {
  const event = await createEvent(`Zyxwvut ${Date.now() % 100000}`);
  try {
    await page.goto(`/event/${event.id}`);
    await expect(page.getByRole('heading', { name: event.name })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Related events' })
    ).toHaveCount(0);
    await expect(page.getByText('No related events.')).toHaveCount(0);
  } finally {
    await deleteEvent(event.id);
  }
});

// #203: editions of an event are linked explicitly, and the event links its
// website and tickets.
test('an event lists its editions, and links its website and tickets', async ({
  page,
}) => {
  const tag = Date.now() % 100000;
  const past = await createEvent(
    `Fjordfest ${tag} 2025`,
    new Date('2025-06-01')
  );
  const now = await createEvent(
    `Fjordfest ${tag} 2026`,
    new Date('2026-06-01')
  );
  try {
    // A member links this year's edition to last year's, and adds the links.
    await signIn(page, MEMBER);
    await page.goto(`/event/${now.id}/edit`);
    await page.getByLabel('Website').fill('fjordfest.example');
    await page.getByLabel('Tickets').fill('https://tickets.example/fjordfest');
    await page
      .getByRole('textbox', { name: 'Search for the previous edition' })
      .fill(`Fjordfest ${tag}`);
    await page.getByRole('button', { name: `Fjordfest ${tag} 2025` }).click();
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page).toHaveURL(`/event/fjordfest-${tag}-2026`);

    await expect(page.getByRole('link', { name: 'Website' })).toHaveAttribute(
      'href',
      'https://fjordfest.example/'
    );
    await expect(page.getByRole('link', { name: 'Tickets' })).toHaveAttribute(
      'href',
      'https://tickets.example/fjordfest'
    );
    await expect(page.getByRole('heading', { name: 'Editions' })).toBeVisible();
    await expect(page.getByText('(this one)')).toBeVisible();
    await expect(
      page.getByRole('link', { name: `Fjordfest ${tag} 2025` })
    ).toHaveAttribute('href', `/event/fjordfest-${tag}-2025`);
    // An edition isn't also a "related event".
    await expect(
      page.getByRole('heading', { name: 'Related events' })
    ).toHaveCount(0);

    // And the other way round.
    await page.goto(`/event/${past.id}`);
    await expect(
      page.getByRole('link', { name: `Fjordfest ${tag} 2026` })
    ).toHaveAttribute('href', `/event/fjordfest-${tag}-2026`);
  } finally {
    await deleteEvent(now.id);
    await deleteEvent(past.id);
  }
});

// #311: upcoming events were in a carousel that rendered nothing, so the
// events page only listed past ones.
test('the events page lists upcoming events, then recent ones', async ({
  page,
}) => {
  const { db, events } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  const day = 24 * 60 * 60 * 1000;
  const at = (offset) => ({
    startsAt: new Date(Date.now() + offset),
    endsAt: new Date(Date.now() + offset + day),
  });
  const [soon, past] = await db
    .insert(events)
    .values([
      { name: `Lanternmoot ${tag}`, ...at(20 * day) },
      { name: `Embermoot ${tag}`, ...at(-3 * day) },
    ])
    .returning();
  try {
    await page.goto('/events');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Events');
    const upcoming = page.getByRole('region', { name: 'Upcoming' });
    await expect(upcoming.getByText(soon.name)).toBeVisible();
    await expect(upcoming.getByText(past.name)).toHaveCount(0);
    await expect(
      page.getByRole('region', { name: 'Recently' }).getByText(past.name)
    ).toBeVisible();
  } finally {
    await db.delete(events).where(inArray(events.id, [soon.id, past.id]));
  }
});

// Design pass: how many events each year, each year a way into its list.
test('the events page charts events per year', async ({ page }) => {
  await page.goto('/events');
  const chart = page.getByRole('region', { name: 'Events per year' });
  const year = chart.getByRole('link').first();
  await expect(year).toHaveAttribute('href', /^\/events\?period=\d{4}$/);
});
