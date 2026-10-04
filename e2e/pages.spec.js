import { expect, test, watchErrors } from './helpers';

// Site-wide checks: every public page renders, the 404 page, phone width.
const pages = ['/', '/games', '/events', '/studios', '/associations', '/about', '/countries', '/places', '/rewind', '/search?q=Conference', '/search', '/search?q=%20', '/signin'];

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

// #195: og:url was "undefined://undefined/..." (and /org/ on event pages).
for (const [type, list] of [['game', '/games'], ['event', '/events'], ['org', '/studios']]) {
  test(`${type} pages share their own absolute URL`, async ({ request, baseURL }) => {
    const html = await (await request.get(list)).text();
    const path = html.match(new RegExp(`/${type}/[0-9a-f-]{36}`))[0];
    const page = await (await request.get(path)).text();
    expect(page).not.toContain('undefined://');
    expect(page).toContain(`<meta property="og:url" content="${new URL(path, baseURL)}"/>`);
  });
}

// #196: descriptions were copied from the events page (or missing, or "."),
// and list pages and the homepage had no share image.
const metaOf = (html, key) =>
  html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];

test('every public page has its own description and a share image', async ({ request }) => {
  const listPages = ['/', '/games', '/events', '/studios', '/associations', '/about', '/places', '/countries'];
  const games = await (await request.get('/games')).text();
  const detail = [
    games.match(/\/game\/[0-9a-f-]{36}/)[0],
    (await (await request.get('/events')).text()).match(/\/event\/[0-9a-f-]{36}/)[0],
    (await (await request.get('/studios')).text()).match(/\/org\/[0-9a-f-]{36}/)[0],
  ];

  const descriptions = new Map();
  for (const path of [...listPages, ...detail]) {
    const html = await (await request.get(path)).text();
    const description = metaOf(html, 'description');
    expect(description, path).toMatch(/[\p{L}\p{N}]/u);
    expect(metaOf(html, 'og:description'), path).toBe(description);
    expect(metaOf(html, 'og:image'), path).toMatch(/^https?:\/\//);
    expect(metaOf(html, 'twitter:card'), path).toBe('summary_large_image');
    if (listPages.includes(path)) descriptions.set(path, description);
  }
  // No two list pages share a description.
  expect(new Set(descriptions.values()).size).toBe(descriptions.size);

  const image = await request.get(new URL(metaOf(await (await request.get('/')).text(), 'og:image')).pathname);
  expect(image.headers()['content-type']).toBe('image/png');
});
