import { and, desc, eq } from 'drizzle-orm';

import { changes, db, events, games, organizations, people, retryBusy, searchText, sources } from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// #338: filling records in from their pages elsewhere. A local stand-in
// serves web pages and Steam's store API.

const BASE = 'http://127.0.0.1:3193';
const ld = (item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`;
const PAGES = {
  '/studio': `<html><head><title>Lanterne Studio</title><meta property="og:description" content="Lanterne makes cosy games in Nantes.">${ld({
    '@type': 'Organization',
    name: 'Lanterne Studio',
    sameAs: ['https://bsky.app/profile/lanterne.bsky.social'],
  })}</head></html>`,
  '/event': `<html><head>${ld({
    '@type': 'Event',
    name: 'Lanterne Jam 2031',
    description: 'A weekend jam.',
    startDate: '2031-04-04T18:00:00+02:00',
    endDate: '2031-04-06T20:00:00+02:00',
    location: { '@type': 'Place', name: 'La Fabrique', address: { addressLocality: 'Nantes', addressCountry: 'FR' } },
    offers: { url: `${BASE}/tickets` },
  })}</head></html>`,
};
const STEAM = {
  77: { success: true, data: { name: 'Lantern Quest', short_description: 'A <i>tiny</i> quest.', website: 'https://lanternquest.example', header_image: 'https://example/header.jpg' } },
};

let server;
test.beforeAll(async () => {
  const { createServer } = await import('node:http');
  server = createServer((req, res) => {
    const url = new URL(req.url, BASE);
    if (url.pathname === '/steam/appdetails') {
      const id = url.searchParams.get('appids');
      // A website of its own each time: one game per website (#346).
      const app = STEAM[id] && { ...STEAM[id], data: { ...STEAM[id].data, website: `https://lanternquest${Date.now()}.example` } };
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ [id]: app ?? { success: false } }));
      return;
    }
    const page = PAGES[url.pathname];
    if (!page) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(page);
  });
  await new Promise((resolve) => server.listen(3193, '127.0.0.1', resolve));
});
test.afterAll(() => new Promise((resolve) => server.close(resolve)));

test('a game added from its Steam page is filled in, and remembers the page', async ({ page }) => {
  const name = `Lantern Quest ${Date.now() % 100000}`;
  try {
    await signIn(page, MEMBER);
    await page.goto('/games/create');
    await waitForHydration(page);
    await page.getByLabel('Start from a link').fill('https://store.steampowered.com/app/77/Lantern_Quest/');
    await page.getByRole('button', { name: 'Fill in' }).click();
    await expect(page.getByTestId('prefilled')).toContainText('Filled in from Steam');
    await expect(page.getByLabel(/^name/i)).toHaveValue('Lantern Quest');
    await page.getByLabel(/^name/i).fill(name);
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
    await expect(page.getByText('A tiny quest.')).toBeVisible();

    const [game] = await retryBusy(() => db.select().from(games).where(eq(games.name, name)));
    expect(game.site).toMatch(/^https:\/\/lanternquest\d+\.example$/);
    const linked = await retryBusy(() => db.select().from(sources).where(eq(sources.recordId, game.id)));
    expect(linked.map((source) => [source.source, source.url])).toEqual([['steam', 'https://store.steampowered.com/app/77/']]);
  } finally {
    // Even when it failed half-way: a leftover game would be the games list's first.
    const made = await retryBusy(() => db.select().from(games).where(eq(games.name, name)));
    for (const game of made) {
      await retryBusy(() => db.delete(sources).where(eq(sources.recordId, game.id)));
      await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    }
  }
});


test('an event form is filled in from its page: name, times where it happens, tickets', async ({ page }) => {
  await signIn(page, MEMBER);
  await page.goto('/events/create');
  await waitForHydration(page);
  await page.getByLabel('Start from a link').fill(`${BASE}/event`);
  await page.getByRole('button', { name: 'Fill in' }).click();
  await expect(page.getByTestId('prefilled')).toContainText('Place: La Fabrique, Nantes');
  await expect(page.getByLabel(/^name/i)).toHaveValue('Lanterne Jam 2031');
  await expect(page.getByLabel(/^start\*?$/i)).toHaveValue('2031-04-04T18:00');
  await expect(page.getByLabel(/^end\*?$/i)).toHaveValue('2031-04-06T20:00');
  await expect(page.getByLabel('Tickets')).toHaveValue(`${BASE}/tickets`);
});

test('the hourly fill writes empty descriptions from websites, as the bot, never over what people did', async ({ page }) => {
  const id = Date.now() % 100000;
  const [empty, cleared] = await db
    .insert(organizations)
    .values([
      { name: `Lanterne ${id}`, type: 'studio', site: `${BASE}/studio`, searchText: searchText('x') },
      { name: `Cleared ${id}`, type: 'studio', site: `${BASE}/studio?cleared`, searchText: searchText('x') },
    ])
    .returning();
  // Someone emptied the second one's description on purpose.
  await db.insert(changes).values({ operation: 'update', tableName: 'organizations', recordId: cleared.id, data: { v: 2, before: { about: 'Old' }, after: { about: null } } });
  try {
    await signIn(page, ADMIN);
    await page.goto('/admin/sources');
    for (const org of [empty, cleared]) {
      await page.getByLabel('Record').fill(`organization:${org.id}`);
      await page.getByRole('button', { name: 'Read the stalest now' }).click();
      await expect(page.getByTestId('sources-result')).toContainText('read 1');
    }

    const [filled] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, empty.id)));
    expect(filled.about).toBe('Lanterne makes cosy games in Nantes.');
    expect(filled.bskyHandle).toBe('lanterne.bsky.social');
    const [untouched] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, cleared.id)));
    expect(untouched.about).toBeNull();

    // In the change log, by the bot, naming its source.
    const [bot] = await retryBusy(() => db.select().from(people).where(eq(people.username, 'indieco-bot')));
    const [change] = await retryBusy(() =>
      db.select().from(changes).where(and(eq(changes.recordId, empty.id), eq(changes.authorId, bot.id))).orderBy(desc(changes.createdAt))
    );
    expect(change.data).toMatchObject({ source: 'website', source_url: `${BASE}/studio`, after: { about: 'Lanterne makes cosy games in Nantes.' } });

    // And its page says where it's from.
    await page.goto(`/org/${empty.id}`);
    await expect(page.getByTestId('source-credit')).toHaveText(/^Description from its website/);
  } finally {
    await retryBusy(() => db.delete(sources).where(eq(sources.recordType, 'organization')));
    await retryBusy(() => db.delete(changes).where(eq(changes.recordId, cleared.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, empty.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, cleared.id)));
  }
});
