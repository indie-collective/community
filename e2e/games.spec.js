import { expect, test, watchErrors } from './helpers';

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
