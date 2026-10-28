import { expect, test } from './helpers';

// #327: game, event and organisation pages can be shared, with plain links.
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

for (const list of ['/games', '/events', '/studios']) {
  test(`a page from ${list} can be shared to Bluesky and copied`, async ({ page }) => {
    await page.goto(list);
    await page.locator('main a[href^="/game/"], main a[href^="/event/"], main a[href^="/org/"]').first().click();
    await expect(page).toHaveURL(/\/(game|event|org)\//);
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
    const title = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    const url = page.url();
    // Opened networks are recorded instead of opening a tab.
    await page.evaluate(() => {
      window.opened = [];
      window.open = (href) => window.opened.push(href);
    });

    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByRole('menuitem', { name: 'Bluesky' }).click();
    const [bluesky] = await page.evaluate(() => window.opened);
    expect(new URL(bluesky).searchParams.get('text')).toBe(`${title} on Indie Collective ${url}`);

    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByRole('menuitem', { name: 'Copy link' }).click();
    await expect(page.getByText('Link copied')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  });
}

test('Mastodon asks for the server once, then remembers it', async ({ page }) => {
  await page.goto('/games');
  await page.locator('main a[href^="/game/"]').first().click();
  await expect(page).toHaveURL(/\/game\//);
  await page.evaluate(() => {
    window.opened = [];
    window.open = (href) => window.opened.push(href);
  });
  let asked = 0;
  page.on('dialog', async (dialog) => {
    asked += 1;
    expect(dialog.defaultValue()).toBe(asked === 1 ? '' : 'piaille.fr');
    await dialog.accept('https://piaille.fr/');
  });
  for (let i = 0; i < 2; i += 1) {
    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByRole('menuitem', { name: 'Mastodon' }).click();
  }
  const opened = await page.evaluate(() => window.opened);
  expect(opened).toHaveLength(2);
  for (const href of opened) expect(href).toMatch(/^https:\/\/piaille\.fr\/share\?text=/);
});
