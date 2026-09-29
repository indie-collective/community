import { expect, test } from '@playwright/test';

import { MEMBER, signIn } from './helpers';

// #170 (multipart parsing) and #171 (the session key): saving the profile
// works and the header shows the new name straight away.
test('editing the profile updates the header', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/profile/edit');

  const name = `Member ${Date.now() % 100000}`;
  await page.getByLabel(/first name/i).fill(name);
  await page.getByLabel(/last name/i).fill('Walker');
  await page.getByLabel(/about/i).fill('Edited by the end-to-end tests.');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL('/profile');
  await page.goto('/');
  await expect(page.getByText(name).first()).toBeVisible();
});

test('a taken username is flagged and the save reports the error', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/profile/edit');
  await page.getByLabel(/username/i).fill('harness-admin');
  await page.getByLabel(/last name/i).fill('Walker');
  await page.getByLabel(/about/i).fill('x');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Something went wrong')).toBeVisible();
});
