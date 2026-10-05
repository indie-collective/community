import { expect, test, watchErrors, MEMBER, signIn } from './helpers';

// #175: the loader discarded its query result, so every country page was a 500.
test('country pages render their cities, and unknown countries are a 404', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/countries');
  const href = await page.locator('a[href^="/country/"]').first().getAttribute('href');

  const response = await page.goto(href, { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Cities', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upcoming events' })).toBeVisible();
  expect(errors).toEqual([]);

  const unknown = await page.goto('/country/zz');
  expect(unknown.status()).toBe(404);
  await expect(page.getByText('Not Found')).toBeVisible();
});

// #258: a country page is the overview of its scene: numbers, cities with
// the studio/association split, associations by city, games made there,
// and its next events.
test('a country page gives the overview of its scene', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const tag = Date.now() % 100000;
  const day = 24 * 60 * 60 * 1000;
  const place = await db.location.create({
    data: { country_code: 'AQ', city: `Frostville ${tag}`, region: 'Ross Dependency' },
  });
  const org = (name, type) => db.entity.create({ data: { name: `${name} ${tag}`, type, location_id: place.id } });
  const orgs = await Promise.all([org('Ice Studio 1', 'studio'), org('Ice Studio 2', 'studio'), org('Penguin Club', 'association')]);
  const game = await db.game.create({
    data: { name: `Glacier Run ${tag}`, game_entity: { create: { entity_id: orgs[0].id } } },
  });
  const event = (name, data) =>
    db.event.create({ data: { name: `${name} ${tag}`, location_id: place.id, starts_at: new Date('2000-01-01'), ends_at: new Date(Date.now() + day), ...data } });
  const events = await Promise.all([
    event('Polar Jam', {}),
    event('Called-off Jam', { status: 'canceled' }),
    event('Old Jam', { ends_at: new Date(Date.now() - day) }),
  ]);
  try {
    await page.goto('/country/aq');
    await expect(page.getByRole('heading', { name: "Antarctica's indie game scene" })).toBeVisible();
    await expect(page).toHaveTitle('Indie game studios and associations in Antarctica');
    for (const [label, list] of [['studios', 'studios'], ['associations', 'associations'], ['games', 'games'], ['upcoming events', 'events']]) {
      await expect(page.getByRole('link', { name: new RegExp(`^[\\d,]+ ${label.replace(/s$/, '')}s?$`) })).toHaveAttribute('href', `/${list}?country=AQ`);
    }

    const city = page.getByRole('listitem').filter({ hasText: `Frostville ${tag}` });
    await expect(city).toContainText('Ross Dependency');
    await expect(city).toContainText('2 studios, 1 association');

    await expect(page.getByRole('link', { name: `Penguin Club ${tag}` })).toHaveAttribute('href', `/org/${orgs[2].id}`);
    await expect(page.getByRole('heading', { name: 'Games made in Antarctica' })).toBeVisible();
    await expect(page.getByText(`Glacier Run ${tag}`)).toBeVisible();

    await expect(page.getByText(`Polar Jam ${tag}`)).toBeVisible();
    await expect(page.getByText(`Called-off Jam ${tag}`)).toHaveCount(0);
    await expect(page.getByText(`Old Jam ${tag}`)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'All events in Antarctica' })).toHaveAttribute('href', '/events?country=AQ');

    // The games list follows: only games made in Antarctica, until the filter is removed.
    await page.getByRole('link', { name: /^All [\d,]+ games?$/ }).click();
    await expect(page).toHaveURL('/games?country=AQ');
    await expect(page.getByText('Made in Antarctica')).toBeVisible();
    await expect(page.getByText(`Glacier Run ${tag}`)).toBeVisible();
    await page.getByRole('button', { name: 'Show games from every country' }).click();
    await expect(page).toHaveURL('/games');
    await expect(page.getByText('Made in Antarctica')).toHaveCount(0);
  } finally {
    await db.event.deleteMany({ where: { id: { in: events.map((e) => e.id) } } });
    await db.game_entity.deleteMany({ where: { game_id: game.id } });
    await db.game.delete({ where: { id: game.id } });
    await db.entity.deleteMany({ where: { id: { in: orgs.map((o) => o.id) } } });
    await db.location.delete({ where: { id: place.id } });
    await db.$disconnect();
  }
});

test('places allows page zoom', async ({ page }) => {
  await page.goto('/places');
  const viewports = await page.locator('meta[name="viewport"]').evaluateAll(
    (elements) => elements.map((element) => element.content),
  );
  expect(viewports.length).toBeGreaterThan(0);
  for (const viewport of viewports) {
    expect(viewport).toContain('width=device-width');
    expect(viewport).not.toMatch(/(?:maximum-scale|user-scalable)\s*=/i);
  }
});

test('clicking a place on the map highlights its card', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/places', { waitUntil: 'networkidle' });
  // Threw "highlight is not defined" when the list rendered the selected card.
  // The first studio pin (clusters come first). Seeded locations are random,
  // so another pin can sit on top of it: dispatch the click on the pin itself
  // rather than clicking where it is on screen.
  await page
    .locator('.pigeon-overlays [data-part="trigger"] svg')
    .first()
    .dispatchEvent('click');
  await expect(page).toHaveURL(/#[0-9a-f-]{36}$/);
  const id = new URL(page.url()).hash.slice(1);
  await expect(page.locator(`[id="${id}"]`)).toHaveCSS('animation-name', 'highlight');
  expect(errors).toEqual([]);
});

// #258: "Explore on the map" from a country page opens /places on it.
test('places opens on a country when given one', async ({ page }) => {
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  const tag = Date.now() % 100000;
  const [reykjavik, sydney] = await Promise.all([
    db.location.create({ data: { country_code: 'IS', city: `Reykjavík ${tag}`, region: 'Capital Region', latitude: 64.1466, longitude: -21.9426 } }),
    db.location.create({ data: { country_code: 'AU', city: `Sydney ${tag}`, region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 } }),
  ]);
  const [near, far] = await Promise.all([
    db.entity.create({ data: { name: `Geyser Games ${tag}`, type: 'studio', location_id: reykjavik.id } }),
    db.entity.create({ data: { name: `Harbour Games ${tag}`, type: 'studio', location_id: sydney.id } }),
  ]);
  try {
    await page.goto('/places?country=IS', { waitUntil: 'networkidle' });
    // The list beside the map shows what's in view: Iceland, not Australia.
    await expect(page.locator(`[id="${near.id}"]`)).toBeAttached();
    await expect(page.locator(`[id="${far.id}"]`)).toHaveCount(0);
  } finally {
    await db.entity.deleteMany({ where: { id: { in: [near.id, far.id] } } });
    await db.location.deleteMany({ where: { id: { in: [reykjavik.id, sydney.id] } } });
    await db.$disconnect();
  }
});

// #212: the event form asked a random a./b./c. OSM subdomain for "@2x"
// tiles, which OSM answers with 400; every map now uses one tile provider.
test.describe('on a high-density screen', () => {
  test.use({ deviceScaleFactor: 2 });

  test('maps load tiles from tile.openstreetmap.org only', async ({ page }) => {
    await signIn(page, MEMBER);
    const events = await (await page.request.get('/events')).text();
    const event = events.match(/\/event\/[0-9a-f-]{36}/)[0];

    for (const path of ['/places', event, `${event}/edit`]) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const tiles = await page.locator('img[src*="openstreetmap.org"]').evaluateAll((imgs) => imgs.map((img) => img.src));
      expect(tiles.length, path).toBeGreaterThan(0);
      for (const src of tiles) expect(src, path).toMatch(/^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/);
      await expect(page.getByRole('link', { name: 'OpenStreetMap' }).first()).toBeVisible();
    }
  });
});
