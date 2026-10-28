import { eq, inArray } from 'drizzle-orm';

import { db, events, gameOrganizations, games, gameTags, organizationEvents, organizations, retryBusy, searchText, setFlag, tags } from './db.js';
import { expect, test, ADMIN, signIn } from './helpers';

// #349: the public read-only API, and widgets for other sites. Behind the
// "api" flag: on for these tests, then back to its default.
test.beforeAll(() => setFlag('api', 'on'));
test.afterAll(() => setFlag('api', null));

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;

test('the API lists and gets games, organisations and events with their links, and nothing private', async ({ request }) => {
  const id = suffix();
  const [studio] = await db
    .insert(organizations)
    .values({ name: `Api Studio ${id}`, slug: `api-studio-${id}`, type: 'studio', countryCode: 'FR', city: 'Lyon', street: '1 rue Secrète', searchText: searchText('x') })
    .returning();
  const [game] = await db.insert(games).values({ name: `Api Game ${id}`, slug: `api-game-${id}`, searchText: 'x' }).returning();
  const [tag] = await db.insert(tags).values({ name: `api${id}` }).returning();
  const startsAt = new Date(Date.now() + 86400000);
  const [event] = await db
    .insert(events)
    .values({ name: `Api Event ${id}`, slug: `api-event-${id}`, searchText: 'x', startsAt, endsAt: new Date(startsAt.getTime() + 3600000), countryCode: 'FR' })
    .returning();
  await db.insert(gameOrganizations).values({ gameId: game.id, organizationId: studio.id, role: 'publisher' });
  await db.insert(gameTags).values({ gameId: game.id, tagId: tag.id });
  await db.insert(organizationEvents).values({ organizationId: studio.id, eventId: event.id });
  try {
    const list = await request.get(`/api/v1/games?tag=api${id}`);
    expect(list.headers()['access-control-allow-origin']).toBe('*');
    expect(list.headers()['content-type']).toBe('application/json; charset=utf-8');
    const { data, next } = await list.json();
    expect(data.map((g) => g.name)).toEqual([game.name]);
    expect(next).toBeNull();

    const one = (await (await request.get(`/api/v1/games/${game.slug}`)).json()).data;
    expect(one).toMatchObject({ id: game.id, name: game.name, tags: [tag.name] });
    expect(one.organizations).toEqual([{ id: studio.id, name: studio.name, url: expect.stringMatching(/\/org\/api-studio-/), role: 'publisher' }]);

    const org = (await (await request.get(`/api/v1/organizations/${studio.id}`)).json()).data;
    expect(org.place).toMatchObject({ country_code: 'FR', city: 'Lyon' });
    expect(JSON.stringify(org)).not.toContain('rue Secrète');
    expect(org.games.map((g) => g.id)).toEqual([game.id]);
    expect(org.events.map((e) => e.id)).toEqual([event.id]);

    const hosted = await (await request.get(`/api/v1/events?organization=${studio.id}`)).json();
    expect(hosted.data.map((e) => e.name)).toEqual([event.name]);

    expect((await request.get('/api/v1/people')).status()).toBe(404);
    expect((await request.get('/api/v1/games/no-such-game')).status()).toBe(404);
    expect((await request.get('/api/v1/organizations?type=company')).status()).toBe(400);
  } finally {
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, studio.id)));
    await retryBusy(() => db.delete(tags).where(eq(tags.id, tag.id)));
  }
});

test('lists are paged with a cursor, without repeats', async ({ request }) => {
  const id = suffix();
  const rows = await db
    .insert(organizations)
    .values(Array.from({ length: 5 }, (_, i) => ({ name: `Paged ${id} ${i}`, type: 'association', city: `Paged${id}`, searchText: 'x', createdAt: new Date(Date.now() - i * 1000) })))
    .returning();
  try {
    const seen = [];
    let url = `/api/v1/organizations?city=Paged${id}&limit=2`;
    while (url) {
      const { data, next } = await (await request.get(url)).json();
      seen.push(...data.map((org) => org.name));
      url = next && new URL(next).pathname + new URL(next).search;
    }
    expect(seen).toEqual([0, 1, 2, 3, 4].map((i) => `Paged ${id} ${i}`));
  } finally {
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, rows.map((row) => row.id))));
  }
});

test('an organisation page offers its widget, which other sites can frame', async ({ page }) => {
  const id = suffix();
  const [assoc] = await db.insert(organizations).values({ name: `Widget ${id}`, slug: `widget-${id}`, type: 'association', searchText: searchText('x') }).returning();
  const startsAt = new Date(Date.now() + 3 * 86400000);
  const [event] = await db
    .insert(events)
    .values({ name: `Widget <Night> ${id}`, searchText: 'x', startsAt, endsAt: new Date(startsAt.getTime() + 3600000), city: 'Nantes' })
    .returning();
  await db.insert(organizationEvents).values({ organizationId: assoc.id, eventId: event.id });
  try {
    await page.goto(`/org/${assoc.slug}`);
    const code = await page.getByTestId('embed-code').innerText();
    expect(code).toContain(`/embed/org/${assoc.slug}/events`);

    const src = code.match(/src="([^"]+)"/)[1];
    const widget = await page.request.get(new URL(src).pathname);
    expect(widget.headers()['content-security-policy']).toContain('frame-ancestors *');
    const html = await widget.text();
    expect(html).toContain(`Widget &lt;Night&gt; ${id}`);
    expect(html).toContain('Nantes');
    expect(html).not.toContain('<script');

    await page.setContent(`<iframe src="${src}" style="width:600px;height:300px" title="widget"></iframe>`);
    await expect(page.frameLocator('iframe').getByRole('link', { name: `Widget <Night> ${id}` })).toBeVisible();
  } finally {
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, assoc.id)));
  }
});

test('the API is documented, with its OpenAPI description', async ({ page, request }) => {
  await page.goto('/api');
  await expect(page.getByRole('heading', { name: 'API', level: 1 })).toBeVisible();
  const spec = await (await request.get('/api/v1/openapi.json')).json();
  expect(spec.openapi).toBe('3.1.0');
  expect(Object.keys(spec.paths)).toEqual(expect.arrayContaining(['/games', '/organizations/{id}', '/events']));
});

// The API is behind its flag, admins only by default: everyone else finds
// nothing there, nor a link to it.
test('the API, its documentation and widgets are hidden while the flag is off for them', async ({ page, request }) => {
  await setFlag('api', null);
  try {
    const [studio] = await retryBusy(() => db.select().from(organizations).limit(1));
    for (const path of ['/api', '/api/v1/games', '/api/v1/openapi.json', `/embed/org/${studio.id}/games`]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
    await page.goto('/about');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'API' })).toHaveCount(0);

    // Admins see it, to try it out.
    await signIn(page, ADMIN);
    expect((await page.goto('/api')).status()).toBe(200);
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'API' })).toBeVisible();

    // On for everyone, everyone gets it.
    await setFlag('api', 'on');
    expect((await request.get('/api/v1/games')).status()).toBe(200);
  } finally {
    await setFlag('api', 'on');
  }
});
