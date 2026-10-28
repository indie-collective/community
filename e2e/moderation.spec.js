import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  changes,
  db,
  events,
  gameOrganizations,
  games,
  idFromPath,
  organizations,
  people,
  retryBusy,
  searchText,
} from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// #309, #340: the change log records what changed, admins undo it, and
// members are kept from changing too much too fast.

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
  await new Promise((resolve) => server.listen(3195, '127.0.0.1', resolve));
});
test.afterAll(() => new Promise((resolve) => server.close(resolve)));

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;
const changesTo = (recordId) =>
  retryBusy(() => db.select().from(changes).where(eq(changes.recordId, recordId)).orderBy(desc(changes.createdAt)));
const personByEmail = async (email) => (await retryBusy(() => db.select().from(people).where(eq(people.email, email))))[0];

async function renameGame(page, game, name) {
  await page.goto(`/game/${game.id}/edit`);
  await waitForHydration(page);
  await page.getByLabel(/^name/i).fill(name);
  await page.getByRole('button', { name: /submit|save/i }).click();
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
}

test('a change keeps only what changed, a save without change keeps nothing, and links are recorded', async ({ page }) => {
  const id = suffix();
  const [game] = await retryBusy(() => db.insert(games).values({ name: `Logged ${id}`, slug: `logged-${id}`, about: 'A long description '.repeat(50) }).returning());
  const [studio] = await retryBusy(() => db.insert(organizations).values({ name: `Logged Studio ${id}`, type: 'studio' }).returning());
  try {
    await signIn(page, MEMBER);
    await renameGame(page, game, `Logged ${id} renamed`);
    let rows = await changesTo(game.id);
    expect(rows).toHaveLength(1);
    // Only the name, and the address that follows it: not the long description.
    expect(rows[0].data).toEqual({
      v: 2,
      before: { name: `Logged ${id}`, slug: `logged-${id}` },
      after: { name: `Logged ${id} renamed`, slug: `logged-${id}-renamed` },
    });

    // The same again: nothing to record.
    await renameGame(page, game, `Logged ${id} renamed`);
    expect(await changesTo(game.id)).toHaveLength(1);

    // Crediting a studio is a change to the game.
    await page.goto(`/game/${game.id}`);
    await page.getByRole('button', { name: 'Add an author to the game' }).click();
    await page.getByPlaceholder('Search...').fill(studio.name);
    const added = page.waitForResponse((response) => response.url().includes('/companies/add'));
    await page.getByRole('listitem').filter({ hasText: studio.name }).click();
    await added;
    rows = await changesTo(game.id);
    expect(rows).toHaveLength(2);
    expect(rows[0].data.before).toEqual({ organizations: [] });
    expect(rows[0].data.after).toEqual({ organizations: [{ organization_id: studio.id, role: 'developer' }] });

    // Moderators hear of it.
    await expect.poll(() => posts.some((post) => post.content.includes(`changed the game “Logged ${id} renamed” (organizations)`))).toBe(true);
    expect(posts.every((post) => post.allowed_mentions?.parse?.length === 0)).toBe(true);
  } finally {
    await retryBusy(() => db.delete(changes).where(eq(changes.recordId, game.id)));
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, studio.id)));
  }
});

test("a member can't delete, and doesn't see Delete", async ({ page }) => {
  const [game] = await retryBusy(() => db.insert(games).values({ name: `Undeletable ${suffix()}` }).returning());
  try {
    await signIn(page, MEMBER);
    await page.goto(`/game/${game.id}`);
    await waitForHydration(page);
    await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
    await page.getByRole('button', { name: 'More actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Report a duplicate' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /delete/i })).toHaveCount(0);
    const response = await page.request.post(`/game/${game.id}/delete`, { maxRedirects: 0 });
    expect(response.status()).not.toBe(302);
    expect((await retryBusy(() => db.select().from(games).where(eq(games.id, game.id))))[0].deletedAt).toBeNull();
  } finally {
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
  }
});

test("a member's changes beyond the hourly limit are refused", async ({ page }) => {
  const email = `busy-${suffix()}@indieco.test`;
  await signIn(page, email);
  const person = await personByEmail(email);
  const [game] = await retryBusy(() => db.insert(games).values({ name: `Busy ${suffix()}` }).returning());
  // Their hour is full (EDITS_PER_HOUR is 100 in the e2e server).
  const full = Array.from({ length: 100 }, () => ({ operation: 'update', tableName: 'games', recordId: game.id, data: {}, authorId: person.id }));
  // D1 takes so many values at a time.
  for (let i = 0; i < full.length; i += 10) await retryBusy(() => db.insert(changes).values(full.slice(i, i + 10)));
  try {
    await page.goto(`/game/${game.id}/edit`);
    await waitForHydration(page);
    await page.getByLabel(/^name/i).fill(`${game.name} vandalised`);
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page.getByText("You've made 100 changes in the last hour.")).toBeVisible();
    expect((await retryBusy(() => db.select().from(games).where(eq(games.id, game.id))))[0].name).toBe(game.name);
    await expect.poll(() => posts.some((post) => post.content.includes(`@${person.username} reached 100 changes in an hour`))).toBe(true);
  } finally {
    await retryBusy(() => db.delete(changes).where(eq(changes.authorId, person.id)));
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(people).where(eq(people.id, person.id)));
  }
});

test('an admin undoes an update, a create and a delete, each in the log', async ({ newPage }) => {
  const id = suffix();
  const [game] = await retryBusy(() => db.insert(games).values({ name: `Undo Me ${id}` }).returning());
  const startsAt = new Date(Date.now() + 86400000);
  const [event] = await retryBusy(() =>
    db
      .insert(events)
      .values({ name: `Undelete Me ${id}`, searchText: searchText('x'), startsAt, endsAt: new Date(startsAt.getTime() + 3600000) })
      .returning()
  );
  let orgId;
  const member = await newPage();
  const admin = await newPage();
  try {
    await signIn(member, MEMBER);
    await renameGame(member, game, `Vandalised ${id}`);
    await member.goto('/orgs/create');
    await waitForHydration(member);
    await member.getByText('Association', { exact: true }).click();
    await member.getByLabel(/^name/i).fill(`Spam Org ${id}`);
    await member.getByRole('button', { name: /submit/i }).click();
    await expect(member).toHaveURL(/\/org\/[a-z0-9-]+$/);
    orgId = await idFromPath(new URL(member.url()).pathname);

    await signIn(admin, ADMIN);
    expect((await admin.request.post(`/event/${event.id}/delete`, { maxRedirects: 0 })).status()).toBe(302);

    await admin.goto('/admin/changes');
    const undo = async (label) => {
      const done = admin.waitForResponse((response) => response.request().method() === 'POST');
      await admin.getByRole('button', { name: label }).first().click();
      await done;
      await expect(admin.getByTestId('moderation-result')).toHaveText('Undone.');
    };
    await undo(`Undo: Changed Vandalised ${id}`);
    await undo(`Undo: Added Spam Org ${id}`);
    await undo(`Undo: Deleted Undelete Me ${id}`);

    expect((await retryBusy(() => db.select().from(games).where(eq(games.id, game.id))))[0].name).toBe(`Undo Me ${id}`);
    expect((await retryBusy(() => db.select().from(organizations).where(eq(organizations.id, orgId))))[0].deletedAt).not.toBeNull();
    expect((await retryBusy(() => db.select().from(events).where(eq(events.id, event.id))))[0].deletedAt).toBeNull();
    expect((await admin.request.get(`/game/${game.id}`)).status()).toBe(200);

    // Each undo is a change too, by the admin, that can itself be undone.
    const [undone] = await changesTo(game.id);
    expect(undone.data.undo_of).toBeTruthy();
    expect(undone.data.after).toMatchObject({ name: `Undo Me ${id}` });
    await admin.goto('/admin/changes');
    await expect(admin.getByTestId('change').filter({ hasText: 'Undid' }).first()).toBeVisible();
  } finally {
    await retryBusy(() => db.delete(changes).where(inArray(changes.recordId, [game.id, event.id, ...(orgId ? [orgId] : [])])));
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
    if (orgId) await retryBusy(() => db.delete(organizations).where(eq(organizations.id, orgId)));
  }
});

test('"Undo all since" restores a vandalised record and skips one edited since by someone else', async ({ newPage }) => {
  const id = suffix();
  const email = `vandal-${id}@indieco.test`;
  const [kept, contested] = await retryBusy(() =>
    db
      .insert(games)
      .values([{ name: `Kept ${id}` }, { name: `Contested ${id}` }])
      .returning()
  );
  const [studio] = await retryBusy(() => db.insert(organizations).values({ name: `Credited ${id}`, type: 'studio' }).returning());
  await retryBusy(() => db.insert(gameOrganizations).values({ gameId: kept.id, organizationId: studio.id }));
  const vandal = await newPage();
  const other = await newPage();
  const admin = await newPage();
  const since = new Date(Date.now() - 60000);
  try {
    await signIn(vandal, email);
    await renameGame(vandal, kept, `Spam ${id}`);
    // Strips the studio too.
    await vandal.goto(`/game/${kept.id}`);
    const removed = vandal.waitForResponse((response) => response.url().includes('/companies/delete'));
    await vandal.getByRole('button', { name: `Remove ${studio.name}` }).click();
    await removed;
    await renameGame(vandal, contested, `Spam too ${id}`);
    // Someone else fixes the second one by hand.
    await signIn(other, MEMBER);
    await renameGame(other, contested, `Contested ${id} fixed`);

    await signIn(admin, ADMIN);
    const person = await personByEmail(email);
    await admin.goto(`/admin/changes?person=${person.username}`);
    await expect(admin.getByRole('heading', { name: `Changes by @${person.username}` })).toBeVisible();
    const local = new Date(since.getTime() - since.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    await admin.getByLabel('Undo all their changes since').fill(local);
    await admin.getByRole('button', { name: 'Undo all since' }).click();
    await expect(admin.getByText('Undid 2 changes.')).toBeVisible();
    await expect(admin.getByText('Skipped, as someone else changed them since:')).toBeVisible();
    await expect(admin.getByTestId('moderation-result').getByRole('link', { name: `Contested ${id} fixed` })).toBeVisible();

    const [restored] = await retryBusy(() => db.select().from(games).where(eq(games.id, kept.id)));
    expect(restored.name).toBe(`Kept ${id}`);
    expect(await retryBusy(() => db.select().from(gameOrganizations).where(eq(gameOrganizations.gameId, kept.id)))).toHaveLength(1);
    expect((await retryBusy(() => db.select().from(games).where(eq(games.id, contested.id))))[0].name).toBe(`Contested ${id} fixed`);

    // And they can be stopped in one click.
    await admin.getByRole('button', { name: `Restrict @${person.username}` }).click();
    await expect(admin.getByText('Restricted: they can no longer change anything.')).toBeVisible();
    expect((await personByEmail(email)).role).toBe('restricted');
  } finally {
    await retryBusy(() => db.delete(changes).where(inArray(changes.recordId, [kept.id, contested.id])));
    await retryBusy(() => db.delete(games).where(inArray(games.id, [kept.id, contested.id])));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, studio.id)));
    await retryBusy(() => db.delete(people).where(and(eq(people.email, email))));
  }
});

test('the moderation page shows how big the change log is, and is for admins only', async ({ page }) => {
  await signIn(page, MEMBER);
  expect((await page.goto('/admin/changes')).status()).toBe(404);
  await signIn(page, ADMIN);
  await page.goto('/admin/changes');
  await expect(page.getByTestId('log-size')).toHaveText(/entries \(\d[\d,]* KB\)|The log is empty\./);
});
