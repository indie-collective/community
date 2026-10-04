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

// #198: "Related events" only appears when there are some.
test('an event with no related events has no empty "Related events" section', async ({ page }) => {
  const { location_id } = await db.event.findFirst({ where: { location_id: { not: null } } });
  const event = await db.event.create({
    data: { name: `Zyxwvut ${Date.now() % 100000}`, starts_at: new Date(Date.now() + 86400000), ends_at: new Date(Date.now() + 2 * 86400000), location_id },
  });
  try {
    await page.goto(`/event/${event.id}`);
    await expect(page.getByRole('heading', { name: event.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Related events' })).toHaveCount(0);
    await expect(page.getByText('No related events.')).toHaveCount(0);
  } finally {
    await db.event.delete({ where: { id: event.id } });
  }
});
