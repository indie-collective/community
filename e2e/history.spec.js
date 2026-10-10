import { expect, test, ADMIN, MEMBER, signIn } from './helpers';

test("a new organisation's history and the admin pages list it", async ({ page }) => {
  const name = `E2E History ${Date.now() % 100000}`;

  await signIn(page, MEMBER);
  await page.goto('/orgs/create');
  await page.getByText('Association', { exact: true }).click();
  await page.getByLabel(/^name/i).fill(name);
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page).toHaveURL(/\/org\/[0-9a-f-]{36}$/);
  const orgUrl = page.url();

  // The history opens on the latest change: the creation, adding the name.
  await page.goto(`${orgUrl}/changes`);
  await expect(page).toHaveURL(/\/changes\/[0-9a-f-]{36}$/);
  await expect(page.getByText(name).first()).toBeVisible();

  await signIn(page, ADMIN);
  await page.goto('/admin/changes');
  await expect(page.getByText(name).first()).toBeVisible();
  // Without games or a location, it's listed under both.
  for (const list of ['making nothing', 'based nowhere']) {
    await page.goto('/admin/missing');
    await page.getByRole('button', { name: `List: ${list}` }).click();
    await expect(page.getByRole('menuitem', { name })).toBeVisible();
  }
});
