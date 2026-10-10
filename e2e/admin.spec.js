import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

test('a member creates an organisation and an admin deletes it', async ({ browser }) => {
  const name = `E2E Studio ${Date.now() % 100000}`;

  const member = await browser.newPage();
  await signIn(member, MEMBER);
  await member.goto('/orgs/create');
  await waitForHydration(member);
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
  await waitForHydration(admin);
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

// #156: rights are stored in the database; an admin changes them on
// /admin/users, and the change applies without signing out.
test('an admin restricts and restores a member, taking effect at once', async ({ browser }) => {
  const email = `e2e-role-${Date.now() % 100000}@indieco.test`;
  const member = await browser.newPage();
  await signIn(member, email);
  const username = email.split('@')[0];
  const name = `Role Check ${Date.now() % 100000}`;
  const create = () =>
    member.request.post('/games/create', {
      form: { name, about: '', site: '', igdb_url: '', tags: '' },
      maxRedirects: 0,
    });

  const admin = await browser.newPage();
  await signIn(admin, ADMIN);
  await admin.goto('/admin/users');
  const role = admin.getByRole('combobox', { name: `Role of ${username}` });
  await expect(role).toHaveValue('member');
  // An admin can't change their own role.
  await expect(admin.getByRole('combobox', { name: 'Role of harness-admin' })).toBeDisabled();

  await role.selectOption('restricted');
  await expect(role).toHaveValue('restricted');
  expect((await create()).status()).toBe(403);
  await member.goto('/welcome');
  await expect(member.getByText('Editing is paused for your account')).toBeVisible();

  await role.selectOption('member');
  await expect(role).toHaveValue('member');
  expect((await create()).status()).toBe(302);

  const { db, games } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  await db.delete(games).where(eq(games.name, name));
  await member.close();
  await admin.close();
});
