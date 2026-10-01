import { expect, test, watchErrors } from './helpers';

const pages = ['/', '/games', '/events', '/studios', '/associations', '/about', '/countries', '/places', '/rewind', '/search?q=Conference', '/signin'];

for (const path of pages) {
  test(`${path} renders and hydrates cleanly`, async ({ page }) => {
    const errors = watchErrors(page);
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response.status()).toBe(200);
    await expect(page.getByRole('link', { name: 'About' }).last()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('unknown pages show the 404 inside the site layout', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response.status()).toBe(404);
  await expect(page.getByText('Not Found')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Games' }).first()).toBeVisible();
});

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

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of ['/', '/games', '/events', '/studios', '/about', '/signin']) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    });
  }
});
