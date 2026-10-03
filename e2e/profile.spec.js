import { expect, test, MEMBER, signIn } from './helpers';

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

// #177: Last name and About are optional (null for new accounts), but the
// form rejected null and required a last name, so new users couldn't save.
test('a new account saves its profile with Last name and About empty', async ({ page }) => {
  await signIn(page, `new-${Date.now()}@indieco.test`);
  await page.goto('/profile/edit');
  await expect(page.getByLabel(/last name/i)).toHaveValue('');
  await expect(page.getByLabel(/about/i)).toHaveValue('');

  const name = `Newcomer ${Date.now() % 100000}`;
  await page.getByLabel(/first name/i).fill(name);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page).toHaveURL('/profile');
  await expect(page.getByText(name).first()).toBeVisible();
});

test('an empty first name is still rejected', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/profile/edit');
  const firstName = page.getByLabel(/first name/i);
  await firstName.fill('');
  await page.getByRole('button', { name: 'Save' }).click();
  // The field is `required`, so the browser blocks the submit with its own message.
  expect(await firstName.evaluate((input) => input.validity.valueMissing)).toBe(true);
  await expect(page).toHaveURL('/profile/edit');
});
