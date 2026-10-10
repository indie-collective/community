import { expect, test, MEMBER, signIn } from './helpers';

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

// #158: members link Bluesky from their profile; unlinking needs another
// way to sign in. (Linking itself goes through Bluesky's OAuth.)
test.describe('linking Bluesky', () => {
  const setPerson = async (email, fields) => {
    const { db, people } = await import('./db.js');
    const { eq } = await import('drizzle-orm');
    await db.update(people).set(fields).where(eq(people.email, email));
  };
  const did = `did:plc:e2e${Date.now() % 100000}`;
  test.afterEach(() => setPerson(MEMBER, { did: null, discordId: null }));

  test('the profile offers to link Bluesky', async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await expect(page.getByLabel('Link your Bluesky account')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Link' })).toBeVisible();
  });

  test('Bluesky as the only sign-in method cannot be unlinked', async ({ page }) => {
    await setPerson(MEMBER, { did });
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await expect(page.getByText('Bluesky is linked')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unlink' })).toBeDisabled();

    // Even asked directly.
    await page.request.post('/profile/bluesky', { form: { intent: 'unlink' } });
    await page.goto('/profile');
    await expect(page.getByText('Bluesky is linked')).toBeVisible();
  });

  test('Bluesky can be unlinked while Discord remains', async ({ page }) => {
    await setPerson(MEMBER, { did, discordId: `e2e-${Date.now()}` });
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Unlink' }).click();
    await expect(page.getByLabel('Link your Bluesky account')).toBeVisible();
  });
});
