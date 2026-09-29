import { expect, test } from '@playwright/test';

import { MEMBER, signIn } from './helpers';

test('protected pages send signed-out visitors to sign-in', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/signin\?prev=\/profile/);
});

test('signing in through the form shows the account in the header', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(MEMBER);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('@harness-member')).toBeVisible();
});

test('logging out clears the session', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/signin/);
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/signin/);
});
