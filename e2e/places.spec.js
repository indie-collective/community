import { expect, test, watchErrors } from './helpers';

// #175: the loader discarded its query result, so every country page was a 500.
test('country pages render their cities, and unknown countries are a 404', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/countries');
  const href = await page.locator('a[href^="/country/"]').first().getAttribute('href');

  const response = await page.goto(href, { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Most vibrant cities' })).toBeVisible();
  await expect(page.getByText(/structures?$/).first()).toBeVisible();
  expect(errors).toEqual([]);

  const unknown = await page.goto('/country/zz');
  expect(unknown.status()).toBe(404);
  await expect(page.getByText('Not Found')).toBeVisible();
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
  // The first studio pin (clusters come first). Seeded locations are random,
  // so another pin can sit on top of it: dispatch the click on the pin itself
  // rather than clicking where it is on screen.
  await page
    .locator('.pigeon-overlays [data-part="trigger"] svg')
    .first()
    .dispatchEvent('click');
  await expect(page).toHaveURL(/#[0-9a-f-]{36}$/);
  const id = new URL(page.url()).hash.slice(1);
  await expect(page.locator(`[id="${id}"]`)).toHaveCSS('animation-name', 'highlight');
  expect(errors).toEqual([]);
});
