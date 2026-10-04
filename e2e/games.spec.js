import { expect, test, watchErrors, MEMBER, signIn } from './helpers';

test('descriptions render, with off-site links in a new tab', async ({ page }) => {
  await page.goto('/games');
  await page.locator('a[href^="/game/"]').first().click();
  await expect(page.getByRole('heading', { name: 'Made by' })).toBeVisible();
  // The seeded description renders as paragraphs (Markdown returned null, #172).
  await expect(page.locator('main p').first()).toBeVisible();
  for (const link of await page.locator('a[href^="http"][target]').all()) {
    await expect(link).toHaveAttribute('target', '_blank');
  }
});

test('clicking a game image opens the lightbox', async ({ page }) => {
  await page.goto('/games');
  await page.locator('a[href^="/game/"]').first().click();
  await expect(page.getByRole('heading', { name: 'Made by' })).toBeVisible();
  // The gallery's Chakra Presence had no `present` prop, and the lightbox
  // referenced an undefined Presence, so nothing opened.
  const errors = watchErrors(page);
  await page.locator('main img[alt=""]').first().click();
  await expect(page.getByRole('button', { name: 'Close Lightbox' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Close Lightbox' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

// #224: the filter's tags were clickable spans, out of reach of the keyboard.
test('the games tag filter works with the keyboard', async ({ page }) => {
  await page.goto('/games');
  const tag = page.getByRole('group', { name: 'Filter by tag' }).getByRole('button').first();
  await expect(tag).toHaveAttribute('aria-pressed', 'false');
  const name = (await tag.innerText()).split('\n')[0].trim();

  await tag.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`tags=${encodeURIComponent(name).replace(/%20/g, '(\\+|%20)')}`, 'i'));
  await expect(tag).toHaveAttribute('aria-pressed', 'true');

  await tag.focus();
  await page.keyboard.press('Space');
  await expect(tag).toHaveAttribute('aria-pressed', 'false');
  await expect(page).not.toHaveURL(/tags=/);
});

// #198: empty sections are hidden from visitors; signed-in users get a hint.
test('a game with no studio hides "Made by" from visitors only', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const game = await db.game.create({ data: { name: `Unattributed ${Date.now() % 100000}` } });
  try {
    await page.goto(`/game/${game.id}`);
    await expect(page.getByRole('heading', { name: game.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Made by' })).toHaveCount(0);

    await signIn(page, MEMBER);
    await page.goto(`/game/${game.id}`);
    await expect(page.getByRole('heading', { name: 'Made by' })).toBeVisible();
    await expect(page.getByText('Who made this game?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add an author to the game' })).toBeVisible();
  } finally {
    await db.game.delete({ where: { id: game.id } });
    await db.$disconnect();
  }
});
