import { expect, test, MEMBER, signIn } from './helpers';

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});

// #198: an org without games or events shows signed-in users how to add them.
test('an empty org page hints at adding games and events when signed in', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const org = await db.entity.create({ data: { name: `Quiet Studio ${Date.now() % 100000}`, type: 'studio' } });
  try {
    await page.goto(`/org/${org.id}`);
    await expect(page.getByText('No games yet.')).toHaveCount(0);

    await signIn(page, MEMBER);
    await page.goto(`/org/${org.id}`);
    await expect(page.getByText('No games yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add a game' })).toHaveAttribute('href', '/games/create');
    await expect(page.getByText('No hosted events yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add an event' })).toHaveAttribute('href', '/events/create');
  } finally {
    await db.entity.delete({ where: { id: org.id } });
    await db.$disconnect();
  }
});
