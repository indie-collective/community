import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { eq } from 'drizzle-orm';

import { db, games, people, retryBusy } from './db.js';
import { expect, test, ADMIN, signIn } from './helpers';

// #304: open data exports, under the ODbL, without people.

test('an export has every record as CSV and JSON, under the licence, and no members', async ({ page }) => {
  const name = `Exported, "quoted" ${Date.now() % 100000}`;
  const [game] = await db.insert(games).values({ name }).returning();
  const [deleted] = await db.insert(games).values({ name: `Gone ${Date.now() % 100000}`, deletedAt: new Date() }).returning();
  try {
    await page.goto('/data');
    await expect(page.getByRole('heading', { name: 'Open data', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Database License (ODbL) 1.0' })).toHaveAttribute('href', 'https://opendatacommons.org/licenses/odbl/1-0/');
    // The data dictionary.
    await expect(page.getByText('game_organizations.csv', { exact: true })).toBeVisible();

    await signIn(page, ADMIN);
    await page.goto('/data');
    await page.getByRole('button', { name: 'Make an export now' }).click();
    await expect(page.getByRole('link', { name: 'Download CSV (zip)' })).toBeVisible();

    const json = await (await page.request.get('/data/latest.json')).json();
    expect(json.licence.name).toBe('Open Database License (ODbL) 1.0');
    expect(json.games.find((g) => g.id === game.id)).toMatchObject({ name, url: expect.stringMatching(new RegExp(`/game/${game.id}$`)) });
    expect(json.games.some((g) => g.id === deleted.id)).toBe(false);

    const zipResponse = await page.request.get('/data/latest.zip');
    expect(zipResponse.headers()['content-type']).toBe('application/zip');
    const archive = await zipResponse.body();
    const dir = mkdtempSync(join(tmpdir(), 'export-'));
    writeFileSync(join(dir, 'latest.zip'), archive);
    const read = (file) => execFileSync('unzip', ['-p', join(dir, 'latest.zip'), file], { encoding: 'utf8' });
    expect(read('games.csv')).toContain(`"${name.replace(/"/g, '""')}"`);
    expect(read('README.txt')).toContain('Licence: Open Database License (ODbL) 1.0');

    // No member, by email or username, anywhere in it.
    const everyone = await retryBusy(() => db.select({ email: people.email, username: people.username }).from(people));
    const text = archive.toString('utf8');
    for (const person of everyone) {
      if (person.email) expect(text.includes(person.email)).toBe(false);
    }
    expect(text).not.toContain('harness-member');
  } finally {
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(games).where(eq(games.id, deleted.id)));
  }
});

test('only admins make exports, and only export files are served', async ({ page }) => {
  const response = await page.request.post('/data', { maxRedirects: 0 });
  expect([302, 404]).toContain(response.status());
  expect((await page.request.get('/data/secret.txt')).status()).toBe(404);
  expect((await page.request.get('/data/..%2Fthumb_x')).status()).toBe(404);
});
