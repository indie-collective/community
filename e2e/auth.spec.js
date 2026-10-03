import { expect, test, MEMBER, signIn } from './helpers';

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

// Their loaders used to return the record to anyone (#179); only the actions
// checked the session.
for (const [type, list] of [['event', '/events'], ['org', '/studios']]) {
  test(`${type} edit pages require sign-in`, async ({ page, request }) => {
    const html = await (await request.get(list)).text();
    const path = `${html.match(new RegExp(`/${type}/[0-9a-f-]{36}`))[0]}/edit`;

    const signedOut = await request.get(path, { maxRedirects: 0 });
    expect(signedOut.status()).toBe(302);
    expect(signedOut.headers().location).toBe(`/signin?prev=${path}`);

    await signIn(page, MEMBER);
    await page.goto(path);
    await expect(page.getByLabel(/^name/i)).not.toHaveValue('');

    const unknown = await page.goto(`/${type}/00000000-0000-4000-8000-000000000000/edit`);
    expect(unknown.status()).toBe(404);
  });
}
