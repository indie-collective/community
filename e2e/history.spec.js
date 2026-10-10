import { expect, test, ADMIN, MEMBER, signIn } from './helpers';

test("a new organisation's history and the admin pages list it", async ({ page }) => {
  const name = `E2E History ${Date.now() % 100000}`;

  await signIn(page, MEMBER);
  await page.goto('/orgs/create');
  await page.getByText('Association', { exact: true }).click();
  await page.getByLabel(/^name/i).fill(name);
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page).toHaveURL(/\/org\/[0-9a-f-]{36}$/);
  const orgUrl = page.url();

  // The history opens on the latest change: the creation, adding the name.
  await page.goto(`${orgUrl}/changes`);
  await expect(page).toHaveURL(/\/changes\/[0-9a-f-]{36}$/);
  await expect(page.getByText(name).first()).toBeVisible();

  await signIn(page, ADMIN);
  await page.goto('/admin/changes');
  await expect(page.getByText(name).first()).toBeVisible();
  // Without games or a location, it's listed under both.
  for (const list of ['making nothing', 'based nowhere']) {
    await page.goto('/admin/missing');
    await page.getByRole('button', { name: `List: ${list}` }).click();
    await expect(page.getByRole('menuitem', { name })).toBeVisible();
  }
});

// Deleting hides the record and keeps its history, with who deleted it.
test('an admin deletes an event, and its history records who', async ({ page }) => {
  const { db, changes, events } = await import('./db.js');
  const { and, desc, eq } = await import('drizzle-orm');
  await signIn(page, ADMIN);
  const created = await page.request.post('/events/create', {
    multipart: { name: `E2E Deleted ${Date.now() % 100000}`, start: '2030-01-01T10:00', end: '2030-01-01T12:00', about: '', site: '' },
    maxRedirects: 0,
  });
  const path = created.headers().location;
  const id = path.split('/').pop();
  try {
    const deleted = await page.request.post(`${path}/delete`, { maxRedirects: 0 });
    expect(deleted.status()).toBe(302);
    expect((await page.request.get(path)).status()).toBe(404);

    const [latest] = await db
      .select()
      .from(changes)
      .where(and(eq(changes.recordId, id), eq(changes.tableName, 'events')))
      .orderBy(desc(changes.createdAt))
      .limit(1);
    expect(latest.operation).toBe('delete');
    expect(latest.authorId).toBeTruthy();
  } finally {
    await db.delete(events).where(eq(events.id, id));
  }
});
