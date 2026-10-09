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
  // Seeded names are random: another game can share or contain the name.
  await expect(page.locator('main h3 a[href^="/game/"]', { hasText: target }).first()).toBeVisible();
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
  // Keep scrolling until the next page arrives: a single wheel event can
  // land before the page has hydrated and listens for scrolls.
  await expect
    .poll(async () => {
      await page.mouse.wheel(0, 20000);
      return cards.count();
    })
    .toBeGreaterThan(firstPage);
  const all = await cards.allInnerTexts();
  expect(all).toEqual([...all].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
});

// The next page only loaded after a scroll brought the bottom into view, so
// when the first page fitted on a tall screen nothing more ever loaded.
test('the games list loads more without scrolling when the first page fits', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 4000 });
  await page.goto('/games');
  const cards = page.locator('main h3 a[href^="/game/"]');
  await expect(cards.first()).toBeVisible();
  await expect.poll(() => cards.count()).toBeGreaterThan(10);
  // No page is loaded twice.
  const hrefs = await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(hrefs.length);
});

test('a game without an "about" gets a generated description', async ({ request }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const game = await db.game.create({ data: { name: `Undescribed ${Date.now() % 100000}`, about: '' } });
  try {
    const html = await (await request.get(`/game/${game.id}`)).text();
    expect(html).toContain('<meta name="description" content="Indie game."/>');
  } finally {
    await db.game.delete({ where: { id: game.id } });
    await db.$disconnect();
  }
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

// #86: the game form points to an IGDB search for the name, and says which site to give.
test('the game form links to an IGDB search for the name', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/games/create');
  await expect(page.getByText("The game's official website, or else its Steam or itch.io page.")).toBeVisible();
  await expect(page.getByRole('link', { name: /searching IGDB/ })).toHaveCount(0);

  await page.getByPlaceholder(/Super Tractor Simulator/).fill('Héros & Co');
  const search = page.getByRole('link', { name: 'searching IGDB for “Héros & Co”' });
  await expect(search).toHaveAttribute('href', 'https://www.igdb.com/search?q=H%C3%A9ros%20%26%20Co');
  await expect(search).toHaveAttribute('target', '_blank');
});
