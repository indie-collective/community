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

// #201: tags were bare chips in a <div>, so text tools read "soloplatformaction".
test('game tags are lists of separate items', async ({ page }) => {
  await page.goto('/games');
  const tagList = page.locator('main').getByRole('list', { name: 'Tags' }).first();
  await expect(tagList).toBeVisible();
  const names = await tagList.getByRole('listitem').allInnerTexts();
  expect(names.length).toBeGreaterThan(1);
  const text = await tagList.innerText();
  for (const name of names) expect(text.split(/\s*\n\s*/)).toContain(name.trim());

  await tagList.locator('xpath=ancestor::*[.//a[starts-with(@href, "/game/")]][1]').locator('a[href^="/game/"]').first().click();
  // The game's own tags (related game cards below have their own lists).
  await expect(page.locator('main').getByRole('list', { name: 'Tags' }).first()).toBeVisible();
});
