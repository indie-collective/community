import { expect, test, MEMBER, signIn } from './helpers';

// #200: the homepage says what the site is, offers search, and invites
// contributions.
test('the homepage searches, and invites contributions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The indie game scene, mapped by its community');
  await expect(page.getByRole('link', { name: 'Add a game' })).toHaveAttribute('href', '/games/create');
  await expect(page.getByText('sign in with Bluesky')).toBeVisible();

  const search = page.getByRole('search').getByRole('textbox', { name: 'Search' });
  await search.fill('Conference');
  await search.press('Enter');
  await expect(page).toHaveURL('/search?q=Conference');
});

// #199: it features complete entries, recently updated, not just the newest.
test('the homepage features complete games only', async ({ page }) => {
  const { db, games, gameImages, gameOrganizations, gameTags, organizations, tags } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const tag = Date.now() % 100000;
  const soon = new Date(Date.now() + 60 * 60 * 1000); // updated "last": first in line
  const [complete, bare] = await db
    .insert(games)
    .values([
      { name: `Complete Quest ${tag}`, updatedAt: soon, createdAt: soon },
      { name: `Bare Quest ${tag}`, updatedAt: soon, createdAt: soon },
    ])
    .returning();
  const [org] = await db.insert(organizations).values({ name: `Credited ${tag}`, type: 'studio' }).returning();
  const [someTag] = await db.select().from(tags).limit(1);
  await db.insert(gameImages).values({ gameId: complete.id, key: 'https://picsum.photos/seed/complete/800/450' });
  await db.insert(gameTags).values({ gameId: complete.id, tagId: someTag.id });
  await db.insert(gameOrganizations).values({ gameId: complete.id, organizationId: org.id });
  try {
    await page.goto('/');
    const featured = page.getByRole('region', { name: 'Games' });
    await expect(featured.getByText(complete.name)).toBeVisible();
    await expect(page.getByText(bare.name)).toHaveCount(0);
  } finally {
    await db.delete(games).where(inArray(games.id, [complete.id, bare.id]));
    await db.delete(organizations).where(inArray(organizations.id, [org.id]));
  }
});

test("a signed-in member sees the events they're going to", async ({ page }) => {
  const { db, events, eventParticipants, people } = await import('./db.js');
  const { and, eq, gte } = await import('drizzle-orm');
  const [member] = await db.select().from(people).where(eq(people.email, MEMBER));
  const [event] = await db.select().from(events).where(gte(events.endsAt, new Date())).limit(1);
  await db.insert(eventParticipants).values({ eventId: event.id, personId: member.id }).onConflictDoNothing();
  try {
    await signIn(page, MEMBER);
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Your next events' }).getByText(event.name)).toBeVisible();
  } finally {
    await db
      .delete(eventParticipants)
      .where(and(eq(eventParticipants.eventId, event.id), eq(eventParticipants.personId, member.id)));
  }
});
