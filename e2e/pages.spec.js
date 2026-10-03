import { expect, test, watchErrors } from './helpers';

// Site-wide checks: every public page renders, the 404 page, phone width.
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

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const path of ['/', '/games', '/events', '/studios', '/about', '/signin']) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    });
  }
});

// #197: count badges sat inside the headings, which then read "Games23".
test('section headings do not include their counts', async ({ page, request }) => {
  const paths = ['/places'];
  for (const [type, list] of [['org', '/studios'], ['org', '/associations'], ['event', '/events']]) {
    const html = await (await request.get(list)).text();
    paths.push(...[...new Set(html.match(new RegExp(`/${type}/[0-9a-f-]{36}`, 'g')))].slice(0, 4));
  }

  let checked = 0;
  for (const path of paths) {
    await page.goto(path);
    const headings = page.getByRole('heading', { name: /^(Games|Hosted events|Locations)\b/ });
    for (const text of await headings.allTextContents()) {
      expect(text, path).toMatch(/^(Games|Hosted events|Locations)$/);
      checked += 1;
    }
  }
  expect(checked).toBeGreaterThan(0);
});
