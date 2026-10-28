import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  changes,
  db,
  events,
  gameImages,
  gameMilestones,
  gameOrganizations,
  games,
  missionClaims,
  organizationEvents,
  organizations,
  people,
  retryBusy,
  searchText,
} from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// #339: fact-finding missions, points and badges.

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;
const personId = async (email) => (await retryBusy(() => db.select().from(people).where(eq(people.email, email))))[0].id;

// Newest first: the ones the mission hands out first.
async function newOrgs(names) {
  const now = Date.now() + 60000;
  return db
    .insert(organizations)
    .values(names.map((name, i) => ({ name, type: 'studio', searchText: searchText(name), createdAt: new Date(now - i * 1000) })))
    .returning();
}

test('a member fills a description on a mission, skips one, and sees what it earned', async ({ page }) => {
  const id = suffix();
  const [first, second, third] = await newOrgs([`Mission First ${id}`, `Mission Second ${id}`, `Mission Third ${id}`]);
  await signIn(page, MEMBER);
  const member = await personId(MEMBER);
  await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, member)));
  const start = Date.now();
  try {
    await page.goto('/missions');
    await page.getByRole('link', { name: 'Start: Studios and associations missing description' }).click();
    await expect(page.getByText('Mission · 1 of 10')).toBeVisible();
    await expect(page.getByTestId('mission-record')).toHaveText(first.name);
    await waitForHydration(page);
    await page.getByLabel('Description').fill('They make tiny games.');
    await page.getByRole('button', { name: 'Save and next' }).click();
    await expect(page.getByText('Mission · 2 of 10')).toBeVisible();
    await expect(page.getByTestId('mission-record')).toHaveText(second.name);

    const [filled] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, first.id)));
    expect(filled.about).toBe('They make tiny games.');
    const [change] = await retryBusy(() => db.select().from(changes).where(eq(changes.recordId, first.id)).orderBy(desc(changes.createdAt)));
    expect(change).toMatchObject({ authorId: member, data: { mission: 'about', after: { about: 'They make tiny games.' } } });

    await page.getByRole('button', { name: "I don't know, skip" }).click();
    await expect(page.getByText('Mission · 3 of 10')).toBeVisible();
    await expect(page.getByTestId('mission-record')).toHaveText(third.name);

    // The end of the mission (straight to it): points and new badges.
    await page.goto(`${new URL(page.url()).pathname}?start=${start}&n=11`);
    const summary = page.getByTestId('mission-summary');
    await expect(summary).toContainText('You completed 1 record and earned 3 points.');
    await expect(summary.getByText('First mission')).toBeVisible();

    // On their profile too.
    const [{ username }] = await retryBusy(() => db.select().from(people).where(eq(people.id, member)));
    await page.goto(`/people/${username}`);
    await expect(page.getByTestId('badges').getByText('First mission')).toBeVisible();

    // Skipped: not given to them again; the one they were on still is.
    await page.goto(`/missions/organization/about?start=${Date.now()}`);
    await expect(page.getByTestId('mission-record')).toHaveText(third.name);
  } finally {
    await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, member)));
    await retryBusy(() => db.delete(changes).where(inArray(changes.recordId, [first.id, second.id, third.id])));
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, [first.id, second.id, third.id])));
  }
});

test("two members on the same mission don't get the same record", async ({ browser }) => {
  const id = suffix();
  const [newest, next] = await newOrgs([`Claimed ${id}`, `Next ${id}`]);
  const one = await browser.newPage();
  const other = await browser.newPage();
  try {
    await signIn(one, MEMBER);
    await signIn(other, ADMIN);
    for (const email of [MEMBER, ADMIN]) {
      const person = await personId(email);
      await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, person)));
    }
    await one.goto(`/missions/organization/about?start=${Date.now()}`);
    await expect(one.getByTestId('mission-record')).toHaveText(newest.name);
    await other.goto(`/missions/organization/about?start=${Date.now()}`);
    await expect(other.getByTestId('mission-record')).toHaveText(next.name);
  } finally {
    await one.close();
    await other.close();
    await retryBusy(() => db.delete(missionClaims).where(inArray(missionClaims.recordId, [newest.id, next.id])));
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, [newest.id, next.id])));
  }
});

test('a record flagged on a mission is listed for admins with what’s missing, until dealt with', async ({ page }) => {
  const id = suffix();
  const [flagged] = await newOrgs([`Flagged ${id}`]);
  await signIn(page, MEMBER);
  const member = await personId(MEMBER);
  await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, member)));
  try {
    await page.goto(`/missions/organization/about?start=${Date.now()}`);
    await expect(page.getByTestId('mission-record')).toHaveText(flagged.name);
    await page.getByLabel("What's wrong").selectOption('duplicate');
    await page.getByRole('button', { name: 'Flag it' }).click();
    await expect(page).toHaveURL(/n=2/);

    await signIn(page, ADMIN);
    await page.goto('/admin/missing?kind=organization&gap=about');
    await expect(page.getByTestId('gap-about')).toContainText(/\d/);
    const flag = page.getByTestId('mission-flag').filter({ hasText: flagged.name });
    await expect(flag).toContainText('It’s a duplicate');
    await flag.getByRole('button', { name: 'Dealt with' }).click();
    await expect(page.getByTestId('mission-flag').filter({ hasText: flagged.name })).toHaveCount(0);
  } finally {
    await retryBusy(() => db.delete(missionClaims).where(and(eq(missionClaims.personId, member))));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, flagged.id)));
  }
});

// #378: every gap is filled on the mission page, not on the record's.
test.describe('gaps filled in place', () => {
  // A 1×1 PNG.
  const PNG = { name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64') };
  const later = () => new Date(Date.now() + 60000);
  let member;
  const made = { games: [], organizations: [], events: [] };

  test.beforeEach(async ({ page }) => {
    await signIn(page, MEMBER);
    member = await personId(MEMBER);
    await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, member)));
  });

  test.afterEach(async () => {
    const ids = [...made.games, ...made.organizations, ...made.events];
    await retryBusy(() => db.delete(missionClaims).where(eq(missionClaims.personId, member)));
    await retryBusy(() => db.delete(changes).where(inArray(changes.recordId, ids)));
    await retryBusy(() => db.delete(games).where(inArray(games.id, made.games)));
    await retryBusy(() => db.delete(events).where(inArray(events.id, made.events)));
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, made.organizations)));
    made.games = [];
    made.organizations = [];
    made.events = [];
  });

  const newGame = async () => {
    const name = `Gap Game ${suffix()}`;
    const [game] = await retryBusy(() => db.insert(games).values({ name, searchText: searchText(name), createdAt: later() }).returning());
    made.games.push(game.id);
    return game;
  };
  const newOrg = async (prefix = 'Gap Studio') => {
    const [org] = await newOrgs([`${prefix} ${suffix()}`]);
    made.organizations.push(org.id);
    return org;
  };
  const newEvent = async () => {
    const name = `Gap Event ${suffix()}`;
    const startsAt = new Date(Date.now() + 30 * 86400000);
    const [event] = await retryBusy(() =>
      db.insert(events).values({ name, searchText: searchText(name), startsAt, endsAt: new Date(startsAt.getTime() + 3600000), createdAt: later() }).returning()
    );
    made.events.push(event.id);
    return event;
  };

  // On the mission, with `record` the one given; saved, it moves on.
  async function onMission(page, kind, gap, record) {
    await page.goto(`/missions/${kind}/${gap}?start=${Date.now()}`);
    await expect(page.getByTestId('mission-record')).toHaveText(record.name);
    await waitForHydration(page);
  }
  async function saveAndNext(page) {
    await page.getByRole('button', { name: 'Save and next' }).click();
    await expect(page).toHaveURL(/n=2/);
  }
  // Credited to the member, as from a mission, and done for them.
  async function expectFilled(kind, record) {
    const [claim] = await retryBusy(() => db.select().from(missionClaims).where(and(eq(missionClaims.personId, member), eq(missionClaims.recordId, record.id))));
    expect(claim.status).toBe('done');
    const [change] = await retryBusy(() => db.select().from(changes).where(eq(changes.recordId, record.id)).orderBy(desc(changes.createdAt)));
    expect(change.authorId).toBe(member);
  }

  test("a game's studio, picked from the search", async ({ page }) => {
    const game = await newGame();
    const studio = await newOrg('Picked Studio');
    await onMission(page, 'game', 'studio', game);
    await page.getByLabel('Studio').fill(studio.name);
    await page.getByRole('button', { name: studio.name }).click();
    await expect(page.getByTestId('mission-picked')).toContainText(studio.name);
    await page.getByLabel('Its role').selectOption('publisher');
    await saveAndNext(page);
    const links = await retryBusy(() => db.select().from(gameOrganizations).where(eq(gameOrganizations.gameId, game.id)));
    expect(links).toMatchObject([{ organizationId: studio.id, role: 'publisher' }]);
    await expectFilled('game', game);
  });

  test("an event's organiser, added when it isn't found", async ({ page }) => {
    const event = await newEvent();
    const name = `Brand New Assoc ${suffix()}`;
    await onMission(page, 'event', 'hosts', event);
    await page.getByLabel('Organiser').fill(name);
    await page.getByRole('button', { name: `Add association “${name}”` }).click();
    await expect(page.getByTestId('mission-picked')).toContainText(`New association: ${name}`);
    await saveAndNext(page);
    const [added] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.name, name)));
    made.organizations.push(added.id);
    expect(added.type).toBe('association');
    const links = await retryBusy(() => db.select().from(organizationEvents).where(eq(organizationEvents.eventId, event.id)));
    expect(links).toMatchObject([{ organizationId: added.id }]);
    await expectFilled('event', event);
  });

  test("a game's image, a studio's logo and an event's cover, uploaded", async ({ page }) => {
    const game = await newGame();
    await onMission(page, 'game', 'images', game);
    await page.getByLabel('Image').setInputFiles(PNG);
    await expect(page.locator('input[name="upload_width"]')).toHaveValue('1');
    await saveAndNext(page);
    expect(await retryBusy(() => db.select().from(gameImages).where(eq(gameImages.gameId, game.id)))).toHaveLength(1);
    await expectFilled('game', game);

    const studio = await newOrg();
    await onMission(page, 'organization', 'logo', studio);
    await page.getByLabel('Logo').setInputFiles(PNG);
    await expect(page.locator('input[name="upload_width"]')).toHaveValue('1');
    await saveAndNext(page);
    const [withLogo] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, studio.id)));
    expect(withLogo.logoKey).toBeTruthy();
    await expectFilled('organization', studio);

    const event = await newEvent();
    await onMission(page, 'event', 'cover', event);
    await page.getByLabel('Cover').setInputFiles(PNG);
    await expect(page.locator('input[name="upload_width"]')).toHaveValue('1');
    await saveAndNext(page);
    const [withCover] = await retryBusy(() => db.select().from(events).where(eq(events.id, event.id)));
    expect(withCover.coverKey).toBeTruthy();
    await expectFilled('event', event);
  });

  test("a studio's location, from the place search", async ({ page }) => {
    await page.route('https://api.mapbox.com/geocoding/**', (route) =>
      route.fulfill({
        json: {
          type: 'FeatureCollection',
          features: [
            {
              id: 'place.1',
              place_type: ['place'],
              text: 'Rennes',
              place_name: 'Rennes, Ille-et-Vilaine, France',
              properties: {},
              geometry: { type: 'Point', coordinates: [-1.68, 48.11] },
              context: [
                { id: 'region.1', text: 'Ille-et-Vilaine', short_code: 'FR-35' },
                { id: 'country.1', text: 'France', short_code: 'fr' },
              ],
            },
          ],
        },
      })
    );
    const studio = await newOrg();
    await onMission(page, 'organization', 'place', studio);
    await page.getByRole('textbox', { name: 'Location' }).fill('Rennes');
    await page.getByRole('button', { name: 'Rennes, Ille-et-Vilaine, France' }).click();
    await saveAndNext(page);
    const [placed] = await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, studio.id)));
    expect(placed).toMatchObject({ countryCode: 'FR', city: 'Rennes', latitude: 48.11, longitude: -1.68 });
    await expectFilled('organization', studio);
  });

  test("a step on a game's timeline", async ({ page }) => {
    const game = await newGame();
    await onMission(page, 'game', 'timeline', game);
    await page.getByLabel('Step').selectOption('announced');
    await page.getByLabel('Year').fill('2024');
    await page.getByLabel('Month').selectOption('3');
    await saveAndNext(page);
    const steps = await retryBusy(() => db.select().from(gameMilestones).where(eq(gameMilestones.gameId, game.id)));
    expect(steps).toMatchObject([{ kind: 'announced', datePrecision: 'month' }]);
    await expectFilled('game', game);
  });

  test('nothing picked: the mission says so and stays on it', async ({ page }) => {
    const game = await newGame();
    await onMission(page, 'game', 'studio', game);
    await page.getByRole('button', { name: 'Save and next' }).click();
    await expect(page.getByText('Pick one, or skip it.')).toBeVisible();
    await expect(page.getByTestId('mission-record')).toHaveText(game.name);
  });
});
