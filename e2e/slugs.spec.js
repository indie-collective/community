import { expect, test, MEMBER, signIn } from './helpers';

// #209: games, organisations and events have readable URLs; UUID URLs
// (permanently) and slugs from before a rename (temporarily) redirect to
// them.
test('a UUID URL redirects to the readable one', async ({ request }) => {
  const { db, games } = await import('./db.js');
  const { isNotNull } = await import('drizzle-orm');
  const [game] = await db.select().from(games).where(isNotNull(games.slug)).limit(1);

  const response = await request.get(`/game/${game.id}`, { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe(`/game/${game.slug}`);

  const page = await request.get(`/game/${game.slug}`);
  expect(page.status()).toBe(200);
  expect(await page.text()).toContain(`/game/${game.slug}"`); // its share URL
});

test('renaming gives a new URL, and the old one still leads there', async ({ page }) => {
  const { db, games } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  await signIn(page, MEMBER);
  const created = await page.request.post('/games/create', {
    form: { name: `Moonlit ${tag}`, about: '', site: '', igdb_url: '', tags: '' },
    maxRedirects: 0,
  });
  expect(created.headers().location).toBe(`/game/moonlit-${tag}`);
  const [game] = await db.select().from(games).where(eq(games.slug, `moonlit-${tag}`));
  try {
    await page.goto(`/game/moonlit-${tag}/edit`);
    await page.getByLabel(/^name/i).fill(`Sunlit ${tag}`);
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page).toHaveURL(`/game/sunlit-${tag}`);

    // Temporarily: the name could come back.
    const old = await page.request.get(`/game/moonlit-${tag}`, { maxRedirects: 0 });
    expect(old.status()).toBe(302);
    expect(old.headers().location).toBe(`/game/sunlit-${tag}`);
  } finally {
    await db.delete(games).where(eq(games.id, game.id));
  }
});

test('an unknown slug is a 404', async ({ request }) => {
  expect((await request.get('/org/no-such-studio-anywhere')).status()).toBe(404);
});
