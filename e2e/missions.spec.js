import { and, desc, eq, inArray } from 'drizzle-orm';

import { changes, db, missionClaims, organizations, people, retryBusy, searchText } from './db.js';
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
