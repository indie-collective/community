import { eq, inArray } from 'drizzle-orm';

import { changes, db, opportunities, organizations, retryBusy, searchText } from './db.js';
import { expect, test, MEMBER, signIn, waitForHydration } from './helpers';

// #345: opportunities posted by organisations, games and events.

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;
const inDays = (days) => new Date(Date.now() + days * 86400000);

test('a member posts a job for a studio; it shows on the studio and the list, and can be taken down', async ({ page }) => {
  const id = suffix();
  const [studio] = await db.insert(organizations).values({ name: `Hiring${id}`, type: 'studio', countryCode: 'FR', searchText: searchText('x') }).returning();
  try {
    await signIn(page, MEMBER);
    await page.goto(`/org/${studio.id}`);
    await page.getByRole('link', { name: 'Post an opportunity' }).click();
    await waitForHydration(page);
    await page.getByLabel('Title').fill(`Junior dev ${id}`);
    await page.getByLabel('Where to apply').fill('jobs.example.com/junior');
    await page.getByText('Can be done remotely').click();
    await page.getByRole('button', { name: 'Post it' }).click();
    await expect(page).toHaveURL(/\/opportunities#/);
    const posted = page.getByTestId('opportunity').filter({ hasText: `Junior dev ${id}` });
    await expect(posted).toContainText('Job or internship');
    await expect(posted).toContainText('Remote');
    await expect(posted).toContainText('France');
    await expect(posted.getByRole('link', { name: studio.name })).toBeVisible();
    await expect(posted.getByRole('link', { name: 'Apply or find out more' })).toHaveAttribute('href', 'https://jobs.example.com/junior');

    const [row] = await retryBusy(() => db.select().from(opportunities).where(eq(opportunities.organizationId, studio.id)));
    // In the change log, as its own record.
    const logged = await retryBusy(() => db.select().from(changes).where(eq(changes.recordId, row.id)));
    expect(logged.map((change) => change.operation)).toEqual(['create']);

    // On the studio's page, and filtered on the list.
    await page.goto(`/org/${studio.id}`);
    await expect(page.getByTestId('opportunity').filter({ hasText: `Junior dev ${id}` })).toBeVisible();
    await page.goto('/opportunities?kind=playtest');
    await expect(page.getByText(`Junior dev ${id}`)).toHaveCount(0);
    await page.goto('/opportunities?kind=job&remote=on');
    await expect(page.getByText(`Junior dev ${id}`)).toBeVisible();

    const removed = page.waitForResponse((response) => response.url().includes('/delete'));
    await page.getByTestId('opportunity').filter({ hasText: `Junior dev ${id}` }).getByRole('button', { name: 'Take down' }).click();
    await removed;
    await expect(page.getByText(`Junior dev ${id}`)).toHaveCount(0);
  } finally {
    await db.delete(organizations).where(eq(organizations.id, studio.id));
  }
});

test('opportunities expire at their end date, and the form refuses more than three months', async ({ page }) => {
  const id = suffix();
  const [studio] = await db.insert(organizations).values({ name: `Expiring${id}`, type: 'studio', searchText: searchText('x') }).returning();
  await db.insert(opportunities).values([
    { kind: 'playtest', title: `Over ${id}`, organizationId: studio.id, endsAt: inDays(-1) },
    { kind: 'playtest', title: `Open ${id}`, organizationId: studio.id, endsAt: inDays(5) },
  ]);
  try {
    await page.goto('/opportunities');
    await expect(page.getByText(`Open ${id}`)).toBeVisible();
    await expect(page.getByText(`Over ${id}`)).toHaveCount(0);

    await signIn(page, MEMBER);
    const response = await page.request.post(`/opportunities/new?for=organization:${studio.id}`, {
      form: { kind: 'job', title: 'Too long', ends_at: inDays(200).toISOString().slice(0, 10) },
    });
    expect(await response.text()).toContain('It can stay up for 92 days at most.');
  } finally {
    await db.delete(organizations).where(eq(organizations.id, studio.id));
  }
});

test('the publishers list keeps those taking pitches now', async ({ page }) => {
  const id = suffix();
  const { games, gameOrganizations } = await import('./db.js');
  const [open, closed] = await db
    .insert(organizations)
    .values([
      { name: `Pitch Open ${id}`, type: 'studio', searchText: searchText('x') },
      { name: `Pitch Closed ${id}`, type: 'studio', searchText: searchText('x') },
    ])
    .returning();
  const [game] = await db.insert(games).values({ name: `Published ${id}` }).returning();
  await db.insert(gameOrganizations).values([
    { gameId: game.id, organizationId: open.id, role: 'publisher' },
    { gameId: game.id, organizationId: closed.id, role: 'publisher' },
  ]);
  await db.insert(opportunities).values({ kind: 'pitches', title: `Pitches ${id}`, organizationId: open.id, endsAt: inDays(10) });
  try {
    await page.goto('/publishers');
    await page.getByText('Open to pitches').click();
    await expect(page).toHaveURL(/pitches=on/);
    await expect(page.locator('main').getByRole('link', { name: open.name })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: closed.name })).toHaveCount(0);
  } finally {
    await db.delete(games).where(eq(games.id, game.id));
    await db.delete(organizations).where(inArray(organizations.id, [open.id, closed.id]));
  }
});
