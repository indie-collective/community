import { eq, inArray } from 'drizzle-orm';

import { db, events, follows, games, notifications, organizations, people, retryBusy, searchText } from './db.js';
import { expect, test, ADMIN, MEMBER, signIn, waitForHydration } from './helpers';

// #343: following games, organisations, events and countries, and hearing
// about them on the site.

const suffix = () => `${Date.now() % 100000}${Math.floor(Math.random() * 100)}`;
const memberId = async () => (await retryBusy(() => db.select().from(people).where(eq(people.email, MEMBER))))[0].id;
const clear = async () => {
  const id = await memberId();
  await retryBusy(() => db.delete(notifications).where(eq(notifications.personId, id)));
  await retryBusy(() => db.delete(follows).where(eq(follows.personId, id)));
};

test('a member follows a studio and hears when it publishes a game, on the site and in their feed', async ({ newPage }) => {
  const id = suffix();
  const [studio] = await retryBusy(() => db.insert(organizations).values({ name: `Followed${id}`, type: 'studio', searchText: searchText('x') }).returning());
  const [game] = await retryBusy(() => db.insert(games).values({ name: `Brought Out ${id}`, searchText: 'x' }).returning());
  const member = await newPage();
  const admin = await newPage();
  try {
    await signIn(member, MEMBER);
    await clear();
    await member.goto(`/org/${studio.id}`);
    await waitForHydration(member);
    const saved = member.waitForResponse((response) => response.url().includes('/follow'));
    await member.getByRole('button', { name: 'Follow' }).click();
    await saved;
    await expect(member.getByRole('button', { name: 'Following' })).toBeVisible();

    // An admin credits the studio as the game's publisher.
    await signIn(admin, ADMIN);
    expect((await admin.request.post(`/game/${game.id}/companies/add`, { form: { id: studio.id, role: 'publisher' } })).ok()).toBe(true);

    const member1 = await memberId();
    await expect
      .poll(async () => (await retryBusy(() => db.select().from(notifications).where(eq(notifications.personId, member1)))).length)
      .toBe(1);
    await member.goto('/');
    await expect(member.getByRole('link', { name: 'Notifications, 1 unread' })).toBeVisible();
    await member.getByRole('link', { name: 'Notifications, 1 unread' }).click();
    const notice = member.getByTestId('notification').first();
    await expect(notice).toHaveText(new RegExp(`^Followed${id} published Brought Out ${id}`));
    await expect(notice.getByRole('link')).toHaveAttribute('href', `/game/${game.id}`);
    // Seen now.
    await member.goto('/');
    await expect(member.getByRole('link', { name: 'Notifications', exact: true })).toBeVisible();

    // The same, in a feed reader.
    await member.goto('/profile');
    const feed = await member.getByRole('link', { name: 'private feed' }).getAttribute('href');
    const xml = await (await member.request.get(feed, { headers: { cookie: '' } })).text();
    expect(xml).toContain(`<title>Followed${id} published Brought Out ${id}</title>`);
  } finally {
    await clear();
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, studio.id)));
  }
});

test("followers of a country hear of new events there, not of the author's own changes", async ({ page, newPage }) => {
  const id = suffix();
  await signIn(page, MEMBER);
  await clear();
  const member = await memberId();
  await retryBusy(() => db.insert(follows).values({ personId: member, recordType: 'country', recordId: 'FR' }));
  let eventId;
  try {
    // The member adds one themself: nothing to tell them.
    const own = await page.request.post('/events/create', {
      multipart: { name: `Own Event ${id}`, start: '2031-01-01T10:00', end: '2031-01-01T12:00', about: '', site: '', city: 'Lyon', country_code: 'FR', latitude: '45.76', longitude: '4.84' },
      maxRedirects: 0,
    });
    expect(own.status()).toBe(302);

    const { idFromPath } = await import('./db.js');
    const admin = await newPage();
    await signIn(admin, ADMIN);
    const created = await admin.request.post('/events/create', {
      multipart: { name: `Jam in Lyon ${id}`, start: '2031-02-01T10:00', end: '2031-02-01T12:00', about: '', site: '', city: 'Lyon', country_code: 'FR', latitude: '45.76', longitude: '4.84' },
      maxRedirects: 0,
    });
    eventId = await idFromPath(created.headers().location);

    await expect
      .poll(async () => (await retryBusy(() => db.select().from(notifications).where(eq(notifications.personId, member)))).map((n) => n.data.message))
      .toEqual([`New event in France: Jam in Lyon ${id}`]);
  } finally {
    await clear();
    await retryBusy(() => db.delete(events).where(inArray(events.name, [`Own Event ${id}`, `Jam in Lyon ${id}`])));
  }
});

test('followers of an event hear when it is canceled, and can stop following from their profile', async ({ page, newPage }) => {
  const id = suffix();
  const startsAt = new Date(Date.now() + 10 * 86400000);
  const [event] = await retryBusy(() =>
    db
      .insert(events)
      .values({ name: `Maybe Fest ${id}`, searchText: searchText('x'), startsAt, endsAt: new Date(startsAt.getTime() + 3600000) })
      .returning()
  );
  await signIn(page, MEMBER);
  await clear();
  const member = await memberId();
  await retryBusy(() => db.insert(follows).values({ personId: member, recordType: 'event', recordId: event.id }));
  try {
    const admin = await newPage();
    await signIn(admin, ADMIN);
    await admin.goto(`/event/${event.id}/edit`);
    await waitForHydration(admin);
    await admin.getByText('Mark as canceled').click();
    await admin.getByRole('button', { name: /submit/i }).click();
    await expect(admin.getByText('This event was canceled.')).toBeVisible();

    await expect
      .poll(async () => (await retryBusy(() => db.select().from(notifications).where(eq(notifications.personId, member)))).map((n) => n.data.message))
      .toEqual([`Maybe Fest ${id} was canceled`]);

    await page.goto('/profile');
    const following = page.getByRole('region', { name: 'Following' }).or(page.locator('section[aria-labelledby="following"]'));
    await expect(following.getByRole('link', { name: event.name })).toBeVisible();
    const saved = page.waitForResponse((response) => response.url().includes('/follow'));
    await following.getByRole('button', { name: 'Following' }).click();
    await saved;
    await expect.poll(async () => (await retryBusy(() => db.select().from(follows).where(eq(follows.personId, member)))).length).toBe(0);
  } finally {
    await clear();
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
  }
});
