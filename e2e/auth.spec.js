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

// #178: signing in always landed on / instead of the page that required it.
test('signing in returns to the page that required it', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/signin\?prev=\/profile$/);
  await page.getByLabel(/email/i).fill(MEMBER);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL('/profile');
});

test('an off-site prev sends signed-in users home instead', async ({ page }) => {
  await page.goto('/signin?prev=//evil.example/');
  await page.getByLabel(/email/i).fill(MEMBER);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/signin?prev=/games');
  await expect(page).toHaveURL('/games');
});

// #34: the team hears about new members on Discord, once, without emails.
test.describe('new member notifications', () => {
  const posts = [];
  let server;
  test.beforeAll(async () => {
    const { createServer } = await import('node:http');
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        posts.push(JSON.parse(body));
        res.writeHead(204).end();
      });
    });
    await new Promise((resolve) => server.listen(3199, '127.0.0.1', resolve));
  });
  test.afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('a new account is announced once', async ({ page }) => {
    const email = `newcomer-${Date.now()}@indieco.test`;
    await signIn(page, email);
    const announced = posts.filter((post) => post.content.startsWith('👋 New member'));
    expect(announced).toHaveLength(1);
    expect(announced[0].content).toContain('**@newcomer-');
    expect(announced[0].content).not.toContain(email);
    expect(announced[0].allowed_mentions).toEqual({ parse: [] });

    await signIn(page, email);
    expect(posts.filter((post) => post.content.startsWith('👋 New member'))).toHaveLength(1);
  });
});
