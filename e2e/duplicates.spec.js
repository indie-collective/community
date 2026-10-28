import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  changes,
  db,
  duplicatePairs,
  gameOrganizations,
  games,
  gameTags,
  organizations,
  retryBusy,
  searchText,
  tags,
} from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// #346: finding and merging duplicate games, organisations and events.

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;

async function insertOrg(name, values = {}) {
  const [org] = await db
    .insert(organizations)
    .values({ name, type: 'studio', searchText: searchText(name), ...values })
    .returning();
  return org;
}

test('adding an organisation asks whether it is one already listed, and refuses the same website', async ({ page }) => {
  const id = suffix();
  const existing = await insertOrg(`Lanterne${id} Studio`, { site: `https://lanterne${id}.fr` });
  try {
    await signIn(page, MEMBER);
    await page.goto('/orgs/create');
    await waitForHydration(page);
    await page.getByText('Studio', { exact: true }).click();
    await page.getByLabel(/^name/i).fill(`Lanterne${id} Games`);
    const hint = page.getByTestId('duplicate-hint');
    await expect(hint.getByRole('link', { name: existing.name })).toBeVisible();
    await expect(hint).toContainText('same name');

    await page.getByPlaceholder('https://example.com').fill(`http://www.lanterne${id}.fr/`);
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText(`“${existing.name}” already has this website.`)).toBeVisible();
    const made = await retryBusy(() => db.select().from(organizations).where(eq(organizations.name, `Lanterne${id} Games`)));
    expect(made).toHaveLength(0);
  } finally {
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, existing.id)));
  }
});

test('a member reports a duplicate, and an admin sees it, or says they differ', async ({ browser }) => {
  const id = suffix();
  const one = await insertOrg(`Reported${id} One`);
  const two = await insertOrg(`Unrelated${id} Two`);
  const member = await browser.newPage();
  const admin = await browser.newPage();
  try {
    await signIn(member, MEMBER);
    await member.goto(`/org/${one.id}`);
    await waitForHydration(member);
    const report = member.getByRole('menuitem', { name: 'Report a duplicate' });
    // The menu can miss a click while the page settles.
    await expect(async () => {
      await member.getByRole('button', { name: 'More actions' }).click();
      await expect(report).toBeVisible({ timeout: 1000 });
    }).toPass();
    await report.click();
    await member.getByLabel('Search for the same studio or association').fill(`Unrelated${id}`);
    await member.getByRole('button', { name: two.name }).click();
    await expect(member.getByText('Thanks! An admin will check it.')).toBeVisible();

    await signIn(admin, ADMIN);
    await admin.goto('/admin/duplicates');
    const pair = admin.getByTestId('duplicate-pair').filter({ hasText: one.name });
    await expect(pair).toContainText(two.name);
    await expect(pair).toContainText('flagged by a member');

    // In either order: pairs are ordered by ID.
    await pair.getByRole('button', { name: /are different$/ }).click();
    await expect(admin.getByTestId('duplicate-pair').filter({ hasText: one.name })).toHaveCount(0);
  } finally {
    await member.close();
    await admin.close();
    await retryBusy(() => db.delete(duplicatePairs).where(inArray(duplicatePairs.firstId, [one.id, two.id])));
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, [one.id, two.id])));
  }
});

test('an admin merges two games: links move, fields are chosen, and the old address leads to the kept one', async ({ page }) => {
  const id = suffix();
  const [kept, other] = await db
    .insert(games)
    .values([
      { name: `Merged${id}`, slug: `merged${id}`, searchText: 'x' },
      { name: `Merged${id} Game`, slug: `merged${id}-game`, about: 'The one with a description.', searchText: 'x' },
    ])
    .returning();
  const [s1, s2] = await Promise.all([insertOrg(`Maker${id} A`), insertOrg(`Maker${id} B`)]);
  const [t1, t2] = await db.insert(tags).values([{ name: `merge${id}a` }, { name: `merge${id}b` }]).returning();
  await db.insert(gameOrganizations).values([
    { gameId: kept.id, organizationId: s1.id },
    { gameId: other.id, organizationId: s2.id, role: 'publisher' },
  ]);
  await db.insert(gameTags).values([
    { gameId: kept.id, tagId: t1.id },
    { gameId: other.id, tagId: t2.id },
  ]);
  try {
    await signIn(page, ADMIN);
    // Suspected by their names.
    await page.goto('/admin/duplicates?kind=game');
    const pair = page.getByTestId('duplicate-pair').filter({ hasText: kept.name });
    await expect(pair).toContainText('same name');
    await pair.getByRole('link', { name: 'Merge…' }).click();
    await waitForHydration(page);

    await page.getByText(`${kept.name} (/game/${kept.slug})`).click();
    // Its own name, not the other's.
    await page.getByRole('radio', { name: kept.name, exact: true }).click({ force: true });
    // The description that isn't empty is chosen.
    await expect(page.getByRole('radio', { name: 'The one with a description.' })).toBeChecked();
    await page.getByRole('button', { name: 'Merge' }).click();
    await expect(page).toHaveURL(new RegExp(`/game/${kept.slug}$`));
    await expect(page.getByText('The one with a description.')).toBeVisible();
    await expect(page.getByRole('link', { name: s2.name }).first()).toBeVisible();

    const [row] = await retryBusy(() => db.select().from(games).where(eq(games.id, kept.id)));
    expect(row.about).toBe('The one with a description.');
    expect((await retryBusy(() => db.select().from(gameOrganizations).where(eq(gameOrganizations.gameId, kept.id)))).map((l) => l.role).sort()).toEqual(['developer', 'publisher']);
    expect(await retryBusy(() => db.select().from(gameTags).where(eq(gameTags.gameId, kept.id)))).toHaveLength(2);

    // The other's addresses, slug or ID, lead to the kept game.
    for (const old of [other.slug, other.id]) {
      await page.goto(`/game/${old}`);
      await expect(page).toHaveURL(new RegExp(`/game/${kept.slug}$`));
    }

    // Both changes are in the log.
    const [deletion] = await retryBusy(() =>
      db.select().from(changes).where(and(eq(changes.recordId, other.id), eq(changes.operation, 'delete'))).orderBy(desc(changes.createdAt))
    );
    expect(deletion.data.merged_into).toBe(kept.id);
    const [update] = await retryBusy(() =>
      db.select().from(changes).where(eq(changes.recordId, kept.id)).orderBy(desc(changes.createdAt)).limit(1)
    );
    expect(update.data.merged_from).toBe(other.id);
  } finally {
    await retryBusy(() => db.delete(changes).where(inArray(changes.recordId, [kept.id, other.id])));
    await retryBusy(() => db.delete(games).where(inArray(games.id, [kept.id, other.id])));
    await retryBusy(() => db.delete(organizations).where(inArray(organizations.id, [s1.id, s2.id])));
    await retryBusy(() => db.delete(tags).where(inArray(tags.id, [t1.id, t2.id])));
  }
});
