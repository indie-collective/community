import { expect, test, MEMBER, signIn } from './helpers';

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});

// #161: studios and associations can show their Bluesky account.
test.describe('Bluesky handles on organizations', () => {
  let server;
  test.beforeAll(async () => {
    const { createServer } = await import('node:http');
    // Knows handles ending in .bsky.social; any other is "Unable to resolve".
    server = createServer((req, res) => {
      const handle = new URL(req.url, 'http://x').searchParams.get('handle') ?? '';
      const known = handle.endsWith('.bsky.social');
      res.writeHead(known ? 200 : 400, { 'content-type': 'application/json' });
      res.end(JSON.stringify(known ? { did: 'did:plc:test' } : { error: 'InvalidRequest' }));
    });
    await new Promise((resolve) => server.listen(3198, '127.0.0.1', resolve));
  });
  test.afterAll(() => new Promise((resolve) => server.close(resolve)));

  test('a handle is normalised, checked and linked; an unknown one is refused', async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto('/orgs/create');
    const name = `Sky Studio ${Date.now() % 100000}`;
    await page.getByText('Association', { exact: true }).click();
    await page.getByLabel(/^name/i).fill(name);
    await page.getByLabel('Bluesky handle').fill('nobody.example.com');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText('No Bluesky account is called "nobody.example.com".')).toBeVisible();

    await page.getByLabel('Bluesky handle').fill('@Sky-Studio.bsky.social');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page).toHaveURL(/\/org\/[0-9a-f-]{36}$/);
    const link = page.getByRole('link', { name: 'Bluesky: @sky-studio.bsky.social' });
    await expect(link).toHaveAttribute('href', 'https://bsky.app/profile/sky-studio.bsky.social');
  });
});
