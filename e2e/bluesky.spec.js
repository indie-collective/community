import { expect, test } from './helpers';

// #157: Bluesky sign-in. A real sign-in needs a Bluesky account; these check
// what doesn't: the form, the published client metadata, and that a forged
// callback signs nobody in.
test('the sign-in page offers Bluesky', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.getByLabel('Your Bluesky handle')).toHaveAttribute('placeholder', 'yourname.bsky.social');
  await expect(page.getByRole('button', { name: 'Sign in with Bluesky' })).toBeVisible();
});

test('the OAuth client metadata is published', async ({ request, baseURL }) => {
  const metadata = await (await request.get('/oauth/client-metadata.json')).json();
  expect(metadata).toMatchObject({
    scope: 'atproto transition:email',
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  });
  // Locally a loopback client, whose callback is on 127.0.0.1.
  expect(metadata.redirect_uris).toEqual([`${baseURL.replace('localhost', '127.0.0.1')}/auth/bluesky/callback`]);
});

test('a forged callback signs nobody in', async ({ page }) => {
  await page.goto('/auth/bluesky/callback?state=forged&code=x&iss=https%3A%2F%2Fbsky.social');
  await expect(page).toHaveURL(/\/signin\?error=/);
  await expect(page.getByText('Signing in with Bluesky failed. Please try again.')).toBeVisible();
  const cookies = await page.context().cookies();
  expect(cookies.find(({ name }) => name === '_session')).toBeUndefined();
});
