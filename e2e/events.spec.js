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
