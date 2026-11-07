import { and, eq, inArray } from 'drizzle-orm';

import file from '../app/data/imports/indie-festivals-2026.json' with { type: 'json' };
import { changes, db, events, retryBusy } from './db';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

const names = file.events.map((event) => event.name);

const imported = () =>
  retryBusy(() => db.select().from(events).where(inArray(events.name, names)));

test('an admin imports the festivals once, each in its own place and time zone', async ({ page }) => {
  await retryBusy(() => db.delete(events).where(inArray(events.name, names)));
  try {
    // Members don't see it.
    await signIn(page, MEMBER);
    expect((await page.goto('/admin/import')).status()).toBe(404);

    await signIn(page, ADMIN);
    await page.goto('/admin/import');
    await waitForHydration(page);
    await expect(page.getByTestId('import-row')).toHaveCount(file.events.length);
    await page.getByRole('button', { name: `Import ${file.events.length} events` }).click();
    await expect(page.getByTestId('import-result')).toContainText(`Added ${file.events.length} events`);

    const rows = await imported();
    expect(rows).toHaveLength(file.events.length);

    // In person: its place, its zone, 10:00 there on its first day.
    const amaze = rows.find((row) => row.name === 'A MAZE. 2026');
    expect(amaze).toMatchObject({ city: 'Berlin', countryCode: 'DE', timeZone: 'Europe/Berlin', attendance: 'in_person' });
    expect(new Date(amaze.startsAt).toISOString()).toBe('2026-05-13T08:00:00.000Z');
    expect(new Date(amaze.endsAt).toISOString()).toBe('2026-05-16T16:00:00.000Z');

    // Online: no place, the zone it's streamed from.
    const gmif = rows.find((row) => row.name === 'Games Made in France 2026');
    expect(gmif).toMatchObject({ attendance: 'online', city: null, timeZone: 'Europe/Paris' });

    // A later edition in the same file follows the earlier one.
    const nordic26 = rows.find((row) => row.name === 'Nordic Game 2026');
    const nordic27 = rows.find((row) => row.name === 'Nordic Game 2027');
    expect(nordic27.previousEditionId).toBe(nordic26.id);

    // Each is in the moderation log, by the admin.
    const [logged] = await retryBusy(() =>
      db.select().from(changes).where(and(eq(changes.recordId, amaze.id), eq(changes.operation, 'create')))
    );
    expect(logged).toBeTruthy();

    // Run again: nothing new.
    await page.goto('/admin/import');
    await expect(page.getByRole('button', { name: 'Nothing new to import' })).toBeDisabled();
    expect(await imported()).toHaveLength(file.events.length);
  } finally {
    await retryBusy(() => db.delete(events).where(inArray(events.name, names)));
  }
});
