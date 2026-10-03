import { expect, test } from './helpers';

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});

// #205: the country filter was a native select of every country; type to narrow it.
test('the studios country filter is searchable', async ({ page }) => {
  await page.goto('/studios');
  const country = page.getByRole('combobox', { name: 'Country' });
  await country.click();
  const first = page.getByRole('option').first();
  const label = (await first.innerText()).trim();
  const name = label.replace(/^\S+\s/, '').replace(/\s*\(\d+\)$/, '');
  const total = await page.getByRole('option').count();

  await country.fill(name.slice(0, 4));
  await expect(page.getByRole('option', { name: label })).toBeVisible();
  expect(await page.getByRole('option').count()).toBeLessThanOrEqual(total);

  await page.getByRole('option', { name: label }).click();
  await expect(page).toHaveURL(/[?&]country=[A-Z]{2}\b/);
  const code = new URL(page.url()).searchParams.get('country');

  await page.goto(`/studios?country=${code}`);
  await expect(page.getByRole('combobox', { name: 'Country' })).toHaveValue(label);
});
