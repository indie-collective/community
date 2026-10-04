import { expect, test } from './helpers';

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});

// #202: cards showed raw "studio"/"assoc", the org page the raw enum value.
for (const [list, label, short] of [['/studios', 'Studio', 'Studio'], ['/associations', 'Association', 'Assoc.']]) {
  test(`${list} labels the org type as "${label}"`, async ({ page }) => {
    await page.goto(list);
    await expect(page.locator('main').getByText(short, { exact: true }).first()).toBeVisible();

    await page.locator('main a[href^="/org/"]').first().click();
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  });
}
