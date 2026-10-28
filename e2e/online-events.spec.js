import { eq, inArray } from 'drizzle-orm';

import { db, events, idFromPath, searchText, retryBusy } from './db.js';
import { expect, test, MEMBER, signIn } from './helpers';
import { eventSlug } from '../app/utils/slug.js';

// #347: online and hybrid events, and events near the visitor.

const findEvent = async (id) => (await db.select().from(events).where(eq(events.id, id)))[0];

async function insertEvent(name, values = {}) {
  const startsAt = new Date(Date.now() + 3 * 86400000);
  const [event] = await db
    .insert(events)
    .values({
      name,
      slug: eventSlug(name, startsAt),
      searchText: searchText(name),
      startsAt,
      endsAt: new Date(startsAt.getTime() + 3600000),
      ...values,
    })
    .returning();
  return event;
}

test.describe('in another time zone', () => {
  test.use({ timezoneId: 'America/New_York' });

  test('a member adds an online event, with its link and time zone, and no place', async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto('/events/create');
    const name = `Online Jam ${Date.now() % 100000}`;
    await page.getByLabel(/^name/i).fill(name);
    await page.getByLabel('Where').selectOption('online');
    // No place to give, but a link and the zone the times are in.
    await expect(page.locator('#location')).toHaveCount(0);
    await page.getByLabel('Online link').fill('itch.io/jam/online-jam');
    await expect(page.getByLabel('Time zone')).toHaveValue('America/New_York');
    await page.getByLabel('Time zone').selectOption('Asia/Tokyo');
    await page.getByLabel(/^start/i).fill('2027-03-06T20:00');
    await page.getByLabel(/^end/i).fill('2027-03-06T23:00');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();

    const id = await idFromPath(new URL(page.url()).pathname);
    try {
      const event = await findEvent(id);
      expect(event).toMatchObject({
        attendance: 'online',
        onlineUrl: 'https://itch.io/jam/online-jam',
        timeZone: 'Asia/Tokyo',
        latitude: null,
        countryCode: null,
      });
      expect(event.startsAt.toISOString()).toBe('2027-03-06T11:00:00.000Z');

      await expect(page.getByText('Event · Upcoming · Online')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Join online' })).toHaveAttribute('href', 'https://itch.io/jam/online-jam');
      await expect(page.getByRole('link', { name: /^Map of/ })).toHaveCount(0);
      // Its times, and the visitor's.
      await expect(page.locator('main time').first()).toHaveText(/^MAR 6, 2027, 20:00 – 23:00$/i);
      await expect(page.getByTestId('visitor-time')).toHaveText('Your time (America/New York): Mar 6, 2027, 06:00 – 09:00');
    } finally {
      await retryBusy(() => db.delete(events).where(eq(events.id, id)));
    }
  });
});

test('the events list filters in person or online events', async ({ page }) => {
  const id = Date.now() % 100000;
  const online = await insertEvent(`Stream Fest ${id}`, { attendance: 'online' });
  const hybrid = await insertEvent(`Both Fest ${id}`, { attendance: 'hybrid', city: 'Lyon', countryCode: 'FR' });
  const inPerson = await insertEvent(`Hall Fest ${id}`, { city: 'Lyon', countryCode: 'FR' });
  try {
    await page.goto('/events');
    await page.getByLabel('Where').selectOption('online');
    await expect(page).toHaveURL(/where=online/);
    await expect(page.getByText(online.name)).toBeVisible();
    await expect(page.getByText(hybrid.name)).toBeVisible();
    await expect(page.getByText(inPerson.name)).toHaveCount(0);

    await page.getByLabel('Where').selectOption('in_person');
    await expect(page).toHaveURL(/where=in_person/);
    await expect(page.getByText(inPerson.name)).toBeVisible();
    await expect(page.getByText(hybrid.name)).toBeVisible();
    await expect(page.getByText(online.name)).toHaveCount(0);
  } finally {
    await retryBusy(() => db.delete(events).where(inArray(events.id, [online.id, hybrid.id, inPerson.id])));
  }
});

test.describe('near the visitor', () => {
  // In Lyon.
  test.use({ geolocation: { latitude: 45.76, longitude: 4.84 }, permissions: ['geolocation'] });

  test('"Near me" keeps the events within the chosen distance', async ({ page }) => {
    const id = Date.now() % 100000;
    const villeurbanne = await insertEvent(`Villeurbanne Meetup ${id}`, { city: 'Villeurbanne', countryCode: 'FR', latitude: 45.7719, longitude: 4.8902 });
    const grenoble = await insertEvent(`Grenoble Meetup ${id}`, { city: 'Grenoble', countryCode: 'FR', latitude: 45.1885, longitude: 5.7245 });
    const tokyo = await insertEvent(`Tokyo Meetup ${id}`, { city: 'Tokyo', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503 });
    try {
      await page.goto('/events');
      await page.getByRole('button', { name: 'Near me' }).click();
      await expect(page).toHaveURL(/near=45\.760%2C4\.840&km=50/);
      await expect(page.getByText(villeurbanne.name)).toBeVisible();
      await expect(page.getByText(grenoble.name)).toHaveCount(0);
      await expect(page.getByText(tokyo.name)).toHaveCount(0);

      // Grenoble is about 95 km away.
      await page.getByLabel('Distance').selectOption('100');
      await expect(page).toHaveURL(/km=100/);
      await expect(page.getByText(grenoble.name)).toBeVisible();
      await expect(page.getByText(tokyo.name)).toHaveCount(0);

      await page.getByRole('button', { name: 'Show events anywhere' }).click();
      await expect(page).not.toHaveURL(/near=/);
      await expect(page.getByText(tokyo.name)).toBeVisible();
    } finally {
      await retryBusy(() => db.delete(events).where(inArray(events.id, [villeurbanne.id, grenoble.id, tokyo.id])));
    }
  });
});
