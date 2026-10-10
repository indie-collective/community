import { expect, test, MEMBER, signIn } from './helpers';

// #254: a game's IGDB data is stored, and refreshed after the response.
// A local stand-in answers for Twitch (the token) and IGDB (the games).
const igdb = { tokens: 0, games: [] };
const GAMES = {
  'standin-celeste': { id: 1, name: 'Celeste', videos: [{ id: 11, name: 'Celeste trailer', video_id: 'celeste1' }] },
  'standin-hades': { id: 2, name: 'Hades', videos: [{ id: 21, name: 'Hades trailer', video_id: 'hades1' }] },
};

let server;
test.beforeAll(async () => {
  const { createServer } = await import('node:http');
  server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/oauth2/token')) {
      igdb.tokens++;
      return res.end(JSON.stringify({ access_token: 'standin-token', expires_in: 3600, token_type: 'bearer' }));
    }
    if (req.url === '/v4/games') {
      const slug = body.match(/where slug = "([^"]*)"/)?.[1];
      igdb.games.push(slug);
      // Slow enough for concurrent views to overlap a running refresh.
      await new Promise((resolve) => setTimeout(resolve, 300));
      return res.end(JSON.stringify(GAMES[slug] ? [GAMES[slug]] : []));
    }
    res.statusCode = 404;
    res.end('[]');
  });
  await new Promise((resolve) => server.listen(3197, '127.0.0.1', resolve));
});
test.afterAll(() => new Promise((resolve) => server.close(resolve)));

test('IGDB data is stored, refreshed after the response, and follows the slug', async ({ page }) => {
  const { db, gameIgdb, games, retryBusy } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const stored = async () =>
    (await retryBusy(() => db.select().from(gameIgdb).where(eq(gameIgdb.gameId, game.id))))[0];
  const name = `IGDB Stand-in ${Date.now() % 100000}`;
  const fetchedAt = async () => (await stored())?.fetchedAt;

  await signIn(page, MEMBER);
  const form = { name, about: '', site: '', tags: '' };
  await page.request.post('/games/create', {
    form: { ...form, igdb_url: 'https://www.igdb.com/games/standin-celeste' },
    maxRedirects: 0,
  });
  const [game] = await retryBusy(() => db.select().from(games).where(eq(games.name, name)));
  try {
    // The first view doesn't wait for IGDB: no data yet, fetched afterwards.
    await page.goto(`/game/${game.id}`);
    await expect(page.getByRole('heading', { name: 'Videos' })).toHaveCount(0);
    await expect.poll(fetchedAt).toBeTruthy();
    expect(igdb.games).toEqual(['standin-celeste']);

    // Fresh data: shown, with no request to IGDB or Twitch.
    const tokens = igdb.tokens;
    await page.reload();
    await expect(page.locator('iframe[title="Celeste trailer"]')).toBeAttached();
    await page.waitForTimeout(500);
    expect(igdb.games).toHaveLength(1);
    expect(igdb.tokens).toBe(tokens);

    // Stale data: served at once by both concurrent views, refreshed once.
    await retryBusy(() =>
      db.update(gameIgdb).set({ fetchedAt: new Date(Date.now() - 2 * 864e5) }).where(eq(gameIgdb.gameId, game.id))
    );
    const views = await Promise.all([1, 2].map(() => page.request.get(`/game/${game.id}`)));
    for (const view of views) expect(await view.text()).toContain('Celeste trailer');
    await expect.poll(async () => (await fetchedAt()) > new Date(Date.now() - 60e3)).toBe(true);
    expect(igdb.games).toEqual(['standin-celeste', 'standin-celeste']);

    // A new slug: the old game's data is gone at once, and the new one follows.
    await page.request.post(`/game/${game.id}/edit`, {
      form: { ...form, igdb_url: 'https://www.igdb.com/games/standin-hades' },
      maxRedirects: 0,
    });
    await page.goto(`/game/${game.id}`);
    await expect(page.locator('iframe[title="Celeste trailer"]')).toHaveCount(0);
    await expect.poll(() => igdb.games.at(-1)).toBe('standin-hades');
    await expect.poll(async () => (await stored()).slug).toBe('standin-hades');
    await expect.poll(fetchedAt).toBeTruthy();
    await page.reload();
    await expect(page.locator('iframe[title="Hades trailer"]')).toBeAttached();
  } finally {
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
  }
});
