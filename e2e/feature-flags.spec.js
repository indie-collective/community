import { eq } from 'drizzle-orm';

import { db, organizations, retryBusy, searchText, setFlag } from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// Feature flags (/admin/flags): opportunities are off until an admin turns
// them on, for admins first, then everyone.

test.afterEach(() => setFlag('opportunities', null));

test('opportunities are hidden while their flag is off', async ({ page }) => {
  const [studio] = await db
    .insert(organizations)
    .values({ name: `Flagged${Date.now() % 100000}`, type: 'studio', searchText: searchText('x') })
    .returning();
  try {
    await signIn(page, MEMBER);
    expect((await page.goto('/opportunities')).status()).toBe(404);
    expect((await page.goto(`/opportunities/new?for=organization:${studio.id}`)).status()).toBe(404);
    await page.goto(`/org/${studio.id}`);
    await expect(page.getByRole('heading', { name: studio.name })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Post an opportunity' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Opportunities' })).toHaveCount(0);
    await page.goto('/publishers');
    await expect(page.getByText('Open to pitches')).toHaveCount(0);
    expect(await (await page.request.get('/sitemap.xml')).text()).not.toContain('/opportunities');
  } finally {
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, studio.id)));
  }
});

test('an admin shows opportunities to admins only, then to everyone', async ({ browser }) => {
  const admin = await browser.newPage();
  await signIn(admin, ADMIN);
  await admin.goto('/admin/flags');
  await waitForHydration(admin);
  const row = admin.getByTestId('flag').filter({ hasText: 'Opportunities' });
  await expect(row.getByTestId('flag-state')).toHaveText('Off');

  await row.getByLabel('Who sees Opportunities').selectOption('admins');
  await row.getByRole('button', { name: 'Save' }).click();
  await expect(row.getByTestId('flag-state')).toHaveText('Admins only');
  await admin.goto('/opportunities');
  await expect(admin.getByRole('heading', { name: 'Opportunities' })).toBeVisible();

  const member = await browser.newPage();
  await signIn(member, MEMBER);
  expect((await member.goto('/opportunities')).status()).toBe(404);

  await admin.goto('/admin/flags');
  await waitForHydration(admin);
  await row.getByLabel('Who sees Opportunities').selectOption('on');
  await row.getByRole('button', { name: 'Save' }).click();
  await expect(row.getByTestId('flag-state')).toHaveText('Everyone');
  expect((await member.goto('/opportunities')).status()).toBe(200);
  await expect(member.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Opportunities' })).toBeVisible();

  await admin.close();
  await member.close();
});

test('members can’t see or change the flags', async ({ page }) => {
  await signIn(page, MEMBER);
  expect((await page.goto('/admin/flags')).status()).toBe(404);
});
