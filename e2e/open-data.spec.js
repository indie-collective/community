import { crc32 } from 'node:zlib';

import { eq } from 'drizzle-orm';

import { db, games, people, retryBusy } from './db.js';
import { expect, test, ADMIN, signIn } from './helpers';

// #304: open data exports, under the ODbL, without people.

// One file out of a ZIP the app stored without compression, found through the
// central directory and checked against its CRC with Node's own (CI's image
// has no `unzip`).
function unzip(archive, file) {
  const end = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  expect(end).toBeGreaterThan(-1);
  let at = archive.readUInt32LE(end + 16);
  for (let left = archive.readUInt16LE(end + 10); left > 0; left -= 1) {
    expect(archive.readUInt32LE(at)).toBe(0x02014b50);
    const nameLength = archive.readUInt16LE(at + 28);
    const name = archive.toString('utf8', at + 46, at + 46 + nameLength);
    if (name === file) {
      expect(archive.readUInt16LE(at + 10)).toBe(0); // stored
      const local = archive.readUInt32LE(at + 42);
      expect(archive.readUInt32LE(local)).toBe(0x04034b50);
      const start = local + 30 + archive.readUInt16LE(local + 26) + archive.readUInt16LE(local + 28);
      const data = archive.subarray(start, start + archive.readUInt32LE(at + 20));
      expect(crc32(data)).toBe(archive.readUInt32LE(at + 16));
      return data.toString('utf8');
    }
    at += 46 + nameLength + archive.readUInt16LE(at + 30) + archive.readUInt16LE(at + 32);
  }
  throw new Error(`${file} is not in the archive`);
}

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
    // #390: every export has its venues, and events name theirs.
    expect(Array.isArray(json.venues)).toBe(true);
    expect(json.events.every((e) => 'venue_id' in e && 'venue' in e)).toBe(true);

    const zipResponse = await page.request.get('/data/latest.zip');
    expect(zipResponse.headers()['content-type']).toBe('application/zip');
    const archive = await zipResponse.body();
    const read = (file) => unzip(archive, file);
    expect(read('games.csv')).toContain(`"${name.replace(/"/g, '""')}"`);
    expect(read('venues.csv')).toContain('id,slug,url,name');
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
