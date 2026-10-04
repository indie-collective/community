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

// #206: the games list could only be filtered by tag.
test('the games list can be searched and sorted', async ({ page }) => {
  await page.goto('/games?sort=name');
  const names = await page.locator('main h3 a[href^="/game/"]').allInnerTexts();
  expect(names.length).toBeGreaterThan(1);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
  await expect(page.getByLabel('Sort by')).toHaveValue('name');

  const target = names[1];
  const word = target.split(/\s+/).find((w) => w.length > 3) ?? target;
  await page.getByRole('searchbox', { name: 'Search games' }).fill(word);
  await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(word)}`));
  await expect(page).toHaveURL(/[?&]sort=name/);
  await expect(page.locator('main h3 a[href^="/game/"]', { hasText: target })).toBeVisible();
  for (const name of await page.locator('main h3 a[href^="/game/"]').allInnerTexts()) {
    expect(name.toLowerCase()).toContain(word.toLowerCase());
  }

  // Tag filters keep the search and the sort.
  await page.getByRole('group', { name: 'Filter by tag' }).getByRole('button').first().click();
  await expect(page).toHaveURL(/[?&]tags=/);
  await expect(page).toHaveURL(/[?&]q=/);
  await expect(page).toHaveURL(/[?&]sort=name/);

  // Unknown sorts fall back to the default.
  expect((await page.request.get('/games?sort=bogus')).status()).toBe(200);

  // Loading more on scroll keeps the sort.
  await page.goto('/games?sort=name');
  const cards = page.locator('main h3 a[href^="/game/"]');
  const firstPage = await cards.count();
  await page.mouse.wheel(0, 20000);
  await expect.poll(() => cards.count()).toBeGreaterThan(firstPage);
  const all = await cards.allInnerTexts();
  expect(all).toEqual([...all].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
});
