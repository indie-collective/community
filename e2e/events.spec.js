import { PrismaClient } from '@prisma/client';

import { expect, test, MEMBER, signIn } from './helpers';

const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

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
  const { location_id } = await db.event.findFirst({ where: { location_id: { not: null } } });
  const event = await db.event.create({
    data: {
      name: `No Cover ${Date.now() % 100000}`,
      starts_at: new Date(Date.now() + 86400000),
      ends_at: new Date(Date.now() + 2 * 86400000),
      location_id,
    },
  });

  try {
    const response = await page.goto(`/event/${event.id}`);
    expect(response.status()).toBe(200);
    const cover = page.getByRole('img', { name: 'Event cover' });
    await expect(cover).toHaveAttribute('src', /placeholder/);
    expect(await cover.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  } finally {
    await db.event.delete({ where: { id: event.id } });
  }
});

// Attendee avatars were raw image rows without thumbnail_url, so every
// attendee showed their initial instead of their picture.
test('event attendees show their avatar', async ({ page }) => {
  const member = await db.person.findUnique({ where: { email: MEMBER } });
  const event = await db.event.findFirst({ where: { cover_id: { not: null }, location_id: { not: null } } });
  const url = 'https://cdn.example.test/avatar-check.png';
  const image = await db.image.create({ data: { image_file: { name: url } } });
  await db.person.update({ where: { id: member.id }, data: { avatar_id: image.id } });
  await db.event_participant.upsert({
    where: { event_id_person_id: { event_id: event.id, person_id: member.id } },
    create: { event_id: event.id, person_id: member.id },
    update: {},
  });

  try {
    await page.goto(`/event/${event.id}`);
    await expect(page.locator(`[title="@${member.username}"] img`)).toHaveAttribute('src', url);
  } finally {
    await db.event_participant.deleteMany({ where: { event_id: event.id, person_id: member.id } });
    await db.person.update({ where: { id: member.id }, data: { avatar_id: member.avatar_id } });
    await db.image.delete({ where: { id: image.id } });
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

  const rennes = { street: '4bis Cours des Alliés', city: 'Rennes', region: 'Ille-et-Vilaine', country_code: 'FR', latitude: '48.10506', longitude: '-1.676466' };
  const kyoto = { street: '', city: 'Kyoto', region: 'Kyoto', country_code: 'JP', latitude: '35.0116', longitude: '135.7681' };

  async function createEvent(page, location, start, end) {
    const response = await page.request.post('/events/create', {
      multipart: { name: `Time Zone ${Date.now() % 100000}`, start, end, about: '', site: '', ...location },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    return response.headers().location;
  }

  test('a Rennes event keeps its local time through an unchanged edit', async ({ page }) => {
    await signIn(page, MEMBER);
    const path = await createEvent(page, rennes, '2026-11-20T14:00', '2026-11-22T19:30');
    const id = path.split('/').pop();
    try {
      expect((await db.event.findUnique({ where: { id } })).time_zone).toBe('Europe/Paris');

      await page.goto(`${path}/edit`);
      await expect(page.getByLabel(/start/i)).toHaveValue('2026-11-20T14:00');
      await page.getByRole('button', { name: /submit|save/i }).click();
      await expect(page).toHaveURL(path);

      const event = await db.event.findUnique({ where: { id } });
      expect(event.starts_at.toISOString()).toBe('2026-11-20T13:00:00.000Z');
      expect(event.ends_at.toISOString()).toBe('2026-11-22T18:30:00.000Z');
      await expect(page.locator('main time').first()).toHaveText(/^NOV 20, 14:00 – NOV 22, 19:30$/i);
    } finally {
      await db.event.delete({ where: { id } });
    }
  });

  test('a Kyoto event shows Kyoto time, the same before and after hydration', async ({ page }) => {
    await signIn(page, MEMBER);
    const path = await createEvent(page, kyoto, '2026-12-05T19:00', '2026-12-05T22:00');
    const id = path.split('/').pop();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text().split('\n')[0]);
    });
    try {
      const html = await (await page.request.get(path)).text();
      expect(html).toContain('Dec 5, 19:00 – 22:00');

      await page.goto(path);
      await expect(page.locator('main time').first()).toHaveText(/^DEC 5, 19:00 – 22:00$/i);
      expect(errors).toEqual([]);
    } finally {
      await db.event.delete({ where: { id } });
    }
  });
});

test.describe('event lists in another time zone', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });

  // Cards formatted times in the viewer's zone (and stringified Dates in
  // <time dateTime>), so a visitor elsewhere saw other times than the server.
  test('event cards show the same times in any browser time zone', async ({ page }) => {
    const html = await (await page.request.get('/events')).text();
    const [, serverText] = html.match(/<time[^>]*>([^<]+)<\/time>/);

    await page.goto('/events', { waitUntil: 'networkidle' });
    const first = page.locator('main time').first();
    await expect(first).toHaveText(serverText);
    expect(await first.getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
