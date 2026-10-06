import { expect, test, MEMBER, signIn } from './helpers';

test('filters narrow the studios list', async ({ page }) => {
  await page.goto('/studios');
  const before = await page.locator('a[href^="/org/"]').count();
  await page.getByText('Has published games').click();
  await expect(page).toHaveURL(/has_games=on/);
  expect(await page.locator('a[href^="/org/"]').count()).toBeLessThanOrEqual(before);
});

// #202: cards showed raw "studio"/"assoc", the org page the raw enum value.
for (const [list, label, short] of [['/studios', 'Studio', 'Studio'], ['/associations', 'Association', 'Assoc.']]) {
  test(`${list} labels the org type as "${label}"`, async ({ page }) => {
    await page.goto(list);
    await expect(page.locator('main').getByText(short, { exact: true }).first()).toBeVisible();

    await page.locator('main a[href^="/org/"]').first().click();
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  });
}

// #205: the country filter was a native select of every country; type to narrow it.
test('the studios country filter is searchable', async ({ page }) => {
  await page.goto('/studios');
  const country = page.getByRole('combobox', { name: 'Country' });
  await country.click();
  const first = page.getByRole('option').first();
  const label = (await first.innerText()).trim();
  const name = label.replace(/^\S+\s/, '').replace(/\s*\(\d+\)$/, '');
  const total = await page.getByRole('option').count();

  await country.fill(name.slice(0, 4));
  await expect(page.getByRole('option', { name: label })).toBeVisible();
  expect(await page.getByRole('option').count()).toBeLessThanOrEqual(total);

  await page.getByRole('option', { name: label }).click();
  await expect(page).toHaveURL(/[?&]country=[A-Z]{2}\b/);
  const code = new URL(page.url()).searchParams.get('country');

  await page.goto(`/studios?country=${code}`);
  await expect(page.getByRole('combobox', { name: 'Country' })).toHaveValue(label);
});

// #198: an org without games or events shows signed-in users how to add them.
test('an empty org page hints at adding games and events when signed in', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const org = await db.entity.create({ data: { name: `Quiet Studio ${Date.now() % 100000}`, type: 'studio' } });
  try {
    await page.goto(`/org/${org.id}`);
    await expect(page.getByText('No games yet.')).toHaveCount(0);

    await signIn(page, MEMBER);
    await page.goto(`/org/${org.id}`);
    await expect(page.getByText('No games yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add a game' })).toHaveAttribute('href', '/games/create');
    await expect(page.getByText('No hosted events yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add an event' })).toHaveAttribute('href', '/events/create');
  } finally {
    await db.entity.delete({ where: { id: org.id } });
    await db.$disconnect();
  }
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

// The lists showed the first 50 orgs and nothing more; the rest load in pages.
test('the studios list loads past the first 50, keeping the filters', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  // XQ is a user-assigned ISO code: no seeded org lives there.
  const location = await db.location.create({ data: { country_code: 'XQ' } });
  // The same updated_at for all, so only the id tie-break keeps pages apart.
  const updated_at = new Date();
  await db.entity.createMany({
    data: Array.from({ length: 55 }, (_, i) => ({
      name: `Paged Studio ${i + 1}`,
      type: 'studio',
      location_id: location.id,
      updated_at,
    })),
  });
  try {
    await page.goto('/studios?country=XQ');
    const cards = page.locator('main a[href^="/org/"]');
    await expect(cards).toHaveCount(50);

    const next = page.waitForRequest((request) => /[?&]page=2\b/.test(request.url()));
    await page.getByRole('button', { name: 'Load more' }).click();
    expect(new URL((await next).url()).searchParams.get('country')).toBe('XQ');

    await expect(cards).toHaveCount(55);
    const hrefs = await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(55);
    await expect(page.getByRole('button', { name: 'Load more' })).toHaveCount(0);

    // Changing a filter starts the list over: none of these has games.
    await page.getByText('Has published games').click();
    await expect(page).toHaveURL(/has_games=on/);
    await expect(cards).toHaveCount(0);
  } finally {
    await db.entity.deleteMany({ where: { location_id: location.id } });
    await db.location.delete({ where: { id: location.id } });
    await db.$disconnect();
  }
});
