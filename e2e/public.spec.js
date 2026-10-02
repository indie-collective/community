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

test('places allows page zoom', async ({ page }) => {
  await page.goto('/places');
  const viewports = await page.locator('meta[name="viewport"]').evaluateAll(
    (elements) => elements.map((element) => element.content),
  );
  expect(viewports.length).toBeGreaterThan(0);
  for (const viewport of viewports) {
    expect(viewport).toContain('width=device-width');
    expect(viewport).not.toMatch(/(?:maximum-scale|user-scalable)\s*=/i);
  }
});

test('clicking a place on the map highlights its card', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/places', { waitUntil: 'networkidle' });
  // Threw "highlight is not defined" when the list rendered the selected card.
  // The first studio pin (clusters come first), clicked on its tip: the
  // middle is the logo's masked-out hole.
  await page
    .locator('.pigeon-overlays [data-part="trigger"]')
    .first()
    .click({ position: { x: 24, y: 40 } });
  await expect(page).toHaveURL(/#[0-9a-f-]{36}$/);
  const id = new URL(page.url()).hash.slice(1);
  await expect(page.locator(`[id="${id}"]`)).toHaveCSS('animation-name', 'highlight');
  expect(errors).toEqual([]);
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
