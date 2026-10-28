import { eq, inArray } from 'drizzle-orm';

import { changes, db, eventParticipants, events, games, people, searchText } from './db.js';
import { expect, test, MEMBER, signIn } from './helpers';
import { eventSlug } from '../app/utils/slug.js';

// #341: public profile pages.

async function newPerson(values = {}) {
  const id = Date.now() % 1000000;
  const [person] = await db
    .insert(people)
    .values({ username: `profile${id}${Math.floor(Math.random() * 100)}`, firstName: 'Ada', lastName: 'Jam', about: 'Makes **tiny** games.', bskyHandle: 'ada.bsky.social', email: `ada${id}@indieco.test`, ...values })
    .returning();
  return person;
}

test('a member’s public page shows who they are, their events and what they added, never their email', async ({ page }) => {
  const person = await newPerson();
  const startsAt = new Date(Date.now() + 86400000);
  const [event] = await db
    .insert(events)
    .values({ name: `Profile Fest ${person.username}`, slug: eventSlug(`Profile Fest ${person.username}`, startsAt), searchText: searchText('x'), startsAt, endsAt: new Date(startsAt.getTime() + 3600000) })
    .returning();
  const [game] = await db.insert(games).values({ name: `Profile Game ${person.username}`, slug: `profile-game-${person.username}` }).returning();
  await db.insert(eventParticipants).values({ eventId: event.id, personId: person.id });
  await db.insert(changes).values([
    { operation: 'create', tableName: 'games', recordId: game.id, data: {}, authorId: person.id },
    { operation: 'update', tableName: 'games', recordId: game.id, data: {}, authorId: person.id },
  ]);
  try {
    await page.goto(`/people/${person.username}`);
    await expect(page.getByRole('heading', { name: 'Ada', level: 1, exact: true })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Jam');
    await expect(page.getByText(`@${person.username}`)).toBeVisible();
    await expect(page.getByRole('link', { name: '@ada.bsky.social' })).toHaveAttribute('href', 'https://bsky.app/profile/ada.bsky.social');
    await expect(page.getByText('Makes tiny games.')).toBeVisible();
    await expect(page.getByTestId('contribution-counts')).toHaveText('Added 1 record and made 1 edit.');
    await expect(page.getByRole('link', { name: game.name }).first()).toHaveAttribute('href', `/game/${game.slug}`);
    const going = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Going to' }) });
    await expect(going.getByText(event.name)).toBeVisible();
    await expect(page.locator('body')).not.toContainText(person.email);

    // Its attendees link to their profiles.
    await page.goto(`/event/${event.slug}`);
    await page.getByRole('link', { name: `@${person.username}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/people/${person.username}$`));
  } finally {
    await db.delete(changes).where(eq(changes.authorId, person.id));
    await db.delete(events).where(eq(events.id, event.id));
    await db.delete(games).where(eq(games.id, game.id));
    await db.delete(people).where(eq(people.id, person.id));
  }
});

test('hidden and restricted profiles are not found', async ({ request }) => {
  const hidden = await newPerson({ profileHidden: true });
  const restricted = await newPerson({ role: 'restricted' });
  try {
    expect((await request.get(`/people/${hidden.username}`)).status()).toBe(404);
    expect((await request.get(`/people/${restricted.username}`)).status()).toBe(404);
    expect((await request.get('/people/nobody-by-this-name')).status()).toBe(404);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain(hidden.username);
  } finally {
    await db.delete(people).where(inArray(people.id, [hidden.id, restricted.id]));
  }
});

test('a member hides their profile, and still sees it themselves', async ({ page, browser }) => {
  await signIn(page, MEMBER);
  const [member] = await db.select().from(people).where(eq(people.email, MEMBER));
  try {
    await page.goto('/profile');
    await page.getByRole('link', { name: 'View your public profile' }).click();
    await expect(page).toHaveURL(new RegExp(`/people/${member.username}$`));

    await page.goto('/profile/edit');
    await page.getByText('Hide my public profile').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).not.toHaveURL(/edit/);
    expect((await db.select().from(people).where(eq(people.id, member.id)))[0].profileHidden).toBe(true);

    await page.goto(`/people/${member.username}`);
    await expect(page.getByText('Only you can see this page: your profile is hidden.')).toBeVisible();
    const visitor = await browser.newPage();
    expect((await visitor.goto(`/people/${member.username}`)).status()).toBe(404);
    await visitor.close();
  } finally {
    await db.update(people).set({ profileHidden: false }).where(eq(people.id, member.id));
  }
});
