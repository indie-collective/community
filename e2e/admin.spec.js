import { expect, test } from '@playwright/test';

import { ADMIN, MEMBER, signIn } from './helpers';

test('a member creates an organisation and an admin deletes it', async ({ browser }) => {
  const name = `E2E Studio ${Date.now() % 100000}`;

  const member = await browser.newPage();
  await signIn(member, MEMBER);
  await member.goto('/orgs/create');
  await member.getByText('Association', { exact: true }).click();
  await member.getByLabel(/^name/i).fill(name);
  await member.getByRole('button', { name: /submit/i }).click();
  await expect(member).toHaveURL(/\/org\/[0-9a-f-]{36}$/);
  await expect(member.getByRole('heading', { name })).toBeVisible();
  const orgUrl = member.url();
  await member.close();

  const admin = await browser.newPage();
  await signIn(admin, ADMIN);
  await admin.goto(orgUrl);
  await admin.getByRole('button', { name: 'Options' }).click();
  await admin.getByRole('menuitem', { name: /delete/i }).click();
  await admin.getByRole('dialog').getByRole('button', { name: /delete/i }).click();
  await expect(admin).toHaveURL(/\/orgs$/);
  await admin.goto(orgUrl);
  await expect(admin.getByText('Not Found')).toBeVisible();
  await admin.close();
});

test('an admin adds and deletes a tag', async ({ page }) => {
  const tag = `e2e-${Date.now() % 100000}`;
  await signIn(page, ADMIN);
  await page.goto('/admin/tags');
  await page.getByPlaceholder('New tag name').fill(tag);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: tag });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('members cannot open admin pages', async ({ page }) => {
  await signIn(page, MEMBER);
  const response = await page.goto('/admin/users');
  expect(response.status()).toBe(404);
});
