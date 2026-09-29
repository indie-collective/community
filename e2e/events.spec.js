import { expect, test } from '@playwright/test';

import { MEMBER, signIn } from './helpers';

// #172: a dialog opened over the event page for signed-in users and blocked
// every control, including joining.
test('a member can join and leave an upcoming event', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/events');
  await page.locator('a[href^="/event/"]').first().click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Past events say "I went!" / "Went" instead.
  const join = page.getByRole('button', { name: /^(let's go!|i went!)$/i });
  const going = page.getByRole('button', { name: /^(going|went)$/i });
  if (await going.isVisible()) {
    await going.click();
    await expect(join).toBeVisible();
  }
  await join.click();
  await expect(going).toBeVisible();
  await going.click();
  await expect(join).toBeVisible();
});

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});
