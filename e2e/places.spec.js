import { expect, test, watchErrors, MEMBER, signIn } from './helpers';

// #175: the loader discarded its query result, so every country page was a 500.
test('country pages render their cities, and unknown countries are a 404', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/countries');
  const href = await page.locator('a[href^="/country/"]').first().getAttribute('href');

  const response = await page.goto(href, { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  // The map where the country has one, a list of cities otherwise.
  await expect(page.getByRole('heading', { name: /^(Where .+'s scene is|Cities)$/ })).toBeVisible();
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
  const { db, events, gameOrganizations, games, organizations } = await import('./db.js');
  const { eq, inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  const day = 24 * 60 * 60 * 1000;
  // McMurdo Station.
  const place = { countryCode: 'AQ', city: `Frostville ${tag}`, region: 'Ross Dependency', latitude: -77.85, longitude: 166.67 };
  const orgs = await db
    .insert(organizations)
    .values(
      [['Ice Studio 1', 'studio'], ['Ice Studio 2', 'studio'], ['Penguin Club', 'association']].map(([name, type]) => ({
        name: `${name} ${tag}`,
        type,
        ...place,
      }))
    )
    .returning();
  const [game] = await db.insert(games).values({ name: `Glacier Run ${tag}` }).returning();
  await db.insert(gameOrganizations).values({ gameId: game.id, organizationId: orgs[0].id });
  const event = (name, data) => ({
    name: `${name} ${tag}`,
    ...place,
    startsAt: new Date('2000-01-01'),
    endsAt: new Date(Date.now() + day),
    ...data,
  });
  const created = await db
    .insert(events)
    .values([event('Polar Jam', {}), event('Called-off Jam', { status: 'canceled' }), event('Old Jam', { endsAt: new Date(Date.now() - day) })])
    .returning();
  try {
    await page.goto('/country/aq');
    await expect(page.getByRole('heading', { name: "Antarctica's indie game scene" })).toBeVisible();
    await expect(page).toHaveTitle('Indie game studios and associations in Antarctica');
    for (const [label, list] of [['studios', 'studios'], ['associations', 'associations'], ['games', 'games'], ['upcoming events', 'events']]) {
      await expect(page.getByRole('link', { name: new RegExp(`^[\\d,]+ ${label.replace(/s$/, '')}s?$`) })).toHaveAttribute('href', `/${list}?country=AQ`);
    }

    // The city, in the list and as a circle on the map; choosing it shows who's there.
    // The map, with the city called out; choosing it shows its studios and associations.
    await expect(page.getByRole('heading', { name: "Where Antarctica's scene is" })).toBeVisible();
    const map = page.getByRole('group', { name: 'Map of the main areas for indie games' });
    const callout = map.getByRole('button', { name: `Frostville ${tag}: 2 studios, 1 association` });
    await expect(callout).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Antarctica on the map' })).toHaveAttribute('href', '/places?country=AQ');

    await callout.click();
    await expect(callout).toHaveAttribute('aria-pressed', 'true');
    const details = page.locator('[aria-live="polite"]', {
      has: page.getByRole('heading', { level: 4, name: new RegExp(`^Frostville ${tag}`) }),
    });
    await expect(details.getByRole('link', { name: '2 studios' })).toHaveAttribute(
      'href',
      `/studios?country=AQ&city=Frostville%20${tag}`
    );
    await expect(details.getByRole('link', { name: '1 association' })).toHaveAttribute(
      'href',
      `/associations?country=AQ&city=Frostville%20${tag}`
    );

    const associations = page.locator('section', { has: page.getByRole('heading', { name: 'Associations', exact: true }) });
    await expect(associations.getByRole('link', { name: `Penguin Club ${tag}` })).toHaveAttribute('href', `/org/${orgs[2].id}`);
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
    await db.delete(events).where(inArray(events.id, created.map((e) => e.id)));
    await db.delete(games).where(eq(games.id, game.id));
    await db.delete(organizations).where(inArray(organizations.id, orgs.map((o) => o.id)));
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
  const { db, organizations } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  // XQ is a user-assigned ISO code, so no seeded place is in it: seeded
  // places sit at random coordinates, and one in the country would widen
  // the map to the world.
  const [near, far] = await db
    .insert(organizations)
    .values([
      { name: `Geyser Games ${tag}`, type: 'studio', countryCode: 'XQ', city: `Reykjavík ${tag}`, region: 'Capital Region', latitude: 64.1466, longitude: -21.9426 },
      { name: `Harbour Games ${tag}`, type: 'studio', countryCode: 'AU', city: `Sydney ${tag}`, region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 },
    ])
    .returning();
  try {
    await page.goto('/places?country=XQ', { waitUntil: 'networkidle' });
    // The list beside the map shows what's in view: Reykjavík, not Sydney.
    await expect(page.locator(`[id="${near.id}"]`)).toBeAttached();
    await expect(page.locator(`[id="${far.id}"]`)).toHaveCount(0);
  } finally {
    await db.delete(organizations).where(inArray(organizations.id, [near.id, far.id]));
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

// ADR 0002: the phone drawer of /places, without MUI. Its header always
// shows; tapping or swiping it opens it to half the screen, and tapping
// outside or swiping down closes it; its list stays mounted meanwhile.
test.describe('the places drawer on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('opens and closes by tap and swipe, keeping its list', async ({ page }) => {
    await page.goto('/places', { waitUntil: 'networkidle' });
    const drawer = page.getByRole('dialog', { name: 'Locations' });
    const header = drawer.locator('header').first();
    const top = async () => (await drawer.boundingBox()).y;

    // Closed: only the header shows, at the bottom; the list is there.
    await expect(header).toBeInViewport();
    expect(await top()).toBeGreaterThan(844 - 120);
    await expect(drawer.locator('a[href^="/org/"]').first()).toBeAttached();

    // A tap opens it to half the screen.
    await header.click();
    await expect.poll(top).toBeLessThan(844 / 2);
    await expect(drawer.locator('a[href^="/org/"]').first()).toBeVisible();

    // A tap outside closes it.
    await page.getByTestId('drawer-backdrop').click({ position: { x: 10, y: 10 } });
    await expect.poll(top).toBeGreaterThan(844 - 120);

    // Swipe up opens, swipe down closes.
    const swipe = async (from, to) => {
      const box = await header.boundingBox();
      const x = box.x + box.width / 2;
      await page.mouse.move(x, box.y + from);
      await page.mouse.down();
      await page.mouse.move(x, box.y + to, { steps: 8 });
      await page.mouse.up();
    };
    await swipe(20, -200);
    await expect.poll(top).toBeLessThan(844 / 2);
    await swipe(20, 300);
    await expect.poll(top).toBeGreaterThan(844 - 120);
  });
});

// #39: closed organisations are hidden from the map unless asked for, and
// their status shows on their page.
test('closed organisations show on the map only when asked for', async ({ page }) => {
  const { db, organizations } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  // XQ: no seeded org lives there.
  const place = { countryCode: 'XQ', city: `Reykjavík ${tag}`, latitude: 64.1466, longitude: -21.9426 };
  const [open, closed] = await db
    .insert(organizations)
    .values([
      { name: `Open Studio ${tag}`, type: 'studio', ...place },
      { name: `Closed Studio ${tag}`, type: 'studio', status: 'closed', ...place },
    ])
    .returning();
  try {
    await page.goto('/places?country=XQ', { waitUntil: 'networkidle' });
    await expect(page.locator(`[id="${open.id}"]`)).toBeAttached();
    await expect(page.locator(`[id="${closed.id}"]`)).toHaveCount(0);

    await page.getByText('Show closed organisations').click();
    await expect(page.locator(`[id="${closed.id}"]`)).toBeAttached();

    await page.goto(`/org/${closed.id}`);
    await expect(page.getByText('Closed', { exact: true })).toBeVisible();
  } finally {
    await db.delete(organizations).where(inArray(organizations.id, [open.id, closed.id]));
  }
});

test('the org form sets the status', async ({ page }) => {
  const { db, organizations } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const [org] = await db.insert(organizations).values({ name: `Pausing Studio ${Date.now() % 100000}`, type: 'studio' }).returning();
  try {
    await signIn(page, MEMBER);
    await page.goto(`/org/${org.id}/edit`);
    await page.getByRole('combobox', { name: 'Status' }).selectOption('hiatus');
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page).toHaveURL(`/org/${org.id}`);
    await expect(page.getByText('On hiatus', { exact: true })).toBeVisible();
  } finally {
    await db.delete(organizations).where(eq(organizations.id, org.id));
  }
});

// #211: upcoming events are on the map too (past ones aren't), and each
// kind can be hidden.
test('the map shows upcoming events, and filters by kind', async ({ page }) => {
  const { db, events, organizations, searchText } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  const day = 24 * 60 * 60 * 1000;
  const place = { countryCode: 'XQ', city: `Reykjavík ${tag}`, latitude: 64.1466, longitude: -21.9426 };
  const event = (name, offset) => ({
    name: `${name} ${tag}`,
    searchText: searchText(`${name} ${tag}`),
    startsAt: new Date(Date.now() + offset),
    endsAt: new Date(Date.now() + offset + day),
    ...place,
  });
  const [soon, past] = await db.insert(events).values([event('Geyser Jam', 30 * day), event('Old Jam', -30 * day)]).returning();
  const [studio] = await db.insert(organizations).values({ name: `Geyser Games ${tag}`, type: 'studio', ...place }).returning();
  try {
    await page.goto('/places?country=XQ', { waitUntil: 'networkidle' });
    await expect(page.locator(`[id="${soon.id}"]`)).toBeAttached();
    await expect(page.locator(`[id="${soon.id}"]`)).toContainText(`Geyser Jam ${tag}`);
    await expect(page.locator(`[id="${past.id}"]`)).toHaveCount(0);
    await expect(page.locator(`[id="${studio.id}"]`)).toBeAttached();

    await page.getByRole('checkbox', { name: 'Studios' }).click({ force: true });
    await expect(page.locator(`[id="${studio.id}"]`)).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Upcoming events' }).click({ force: true });
    await expect(page.locator(`[id="${soon.id}"]`)).toHaveCount(0);
  } finally {
    await db.delete(events).where(inArray(events.id, [soon.id, past.id]));
    await db.delete(organizations).where(inArray(organizations.id, [studio.id]));
  }
});
