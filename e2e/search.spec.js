import { decodeRouteData, expect, test } from './helpers';

// #176: the autocomplete endpoints crashed on a missing or blank query.
for (const endpoint of ['/search-game', '/search-org', '/search-event']) {
  test(`${endpoint} answers an empty query without crashing`, async ({
    request,
  }) => {
    for (const query of ['', '?q=', '?q=%20%20']) {
      const response = await request.get(`${endpoint}${query}`);
      expect(response.status(), `${endpoint}${query}`).toBe(200);
    }
  });
}

// The autocomplete endpoints find what they're asked for. /search-event
// read `url`, which didn't exist, so every search failed with "Something
// went wrong".
for (const [endpoint, table] of [
  ['/search-game', 'games'],
  ['/search-org', 'organizations'],
  ['/search-event', 'events'],
]) {
  test(`${endpoint} finds a record by a word of its name`, async ({
    request,
  }) => {
    const schema = await import('./db.js');
    const { searchWords } = await import('../app/db/search.js');
    // Seeded names are random and share words ("Group", "Inc"), and pickers
    // show ten matches: take a word of a name that at most five records have.
    const rows = await schema.db
      .select({
        name: schema[table].name,
        searchText: schema[table].searchText,
      })
      .from(schema[table]);
    // Records with a word starting with this one, as search matches them.
    const sharing = (word) =>
      rows.filter(({ searchText }) =>
        searchWords(searchText).some((w) => w.startsWith(word))
      ).length;
    let record;
    let word;
    for (const row of rows) {
      word = searchWords(row.name).find(
        (w) => w.length >= 4 && sharing(w) <= 5
      );
      if (word) {
        record = row;
        break;
      }
    }

    const response = await request.get(
      `${endpoint}.data?q=${encodeURIComponent(word)}`
    );
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain('Something went wrong');
    expect(body).toContain(record.name);
  });
}

// #306: full-text search. Records are set up directly in the database, so
// these also check that the triggers keep the index current.
const unique = () =>
  `${Date.now() % 1000000}${Math.floor(Math.random() * 1000)}`;
// What /search found for `q`: each kind's results, best first.
const searchData = async (request, q) => {
  const response = await request.get(`/search.data?q=${encodeURIComponent(q)}`);
  expect(response.status()).toBe(200);
  return decodeRouteData(await response.text(), 'routes/search').results;
};
const names = (records) => records.map((record) => record.name);
// The names of everything /search found for `q`.
const found = async (request, q) => {
  return names(Object.values(await searchData(request, q)).flat());
};

test('names rank above descriptions, which say why they matched', async ({
  request,
}) => {
  const { db, games } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const word = `brightmoss${unique()}`;
  const [described, named] = await db
    .insert(games)
    .values([
      {
        name: `Underbrush ${word.slice(-4)}`,
        about: `A sequel to ${word}, with more moss.`,
      },
      { name: `${word} Deluxe` },
    ])
    .returning();
  try {
    const { game: games } = await searchData(request, word.slice(0, -2));
    expect(names(games)).toEqual([named.name, described.name]);
    expect(games[0].search_match).toBeNull();
    // The description's snippet, the word marked.
    expect(games[1].search_match).toEqual({
      field: 'about',
      text: `A sequel to \u0002${word}\u0003, with more moss.`,
    });
  } finally {
    await db.delete(games).where(inArray(games.id, [described.id, named.id]));
  }
});

test('a game is found by its tags and studios, and leaves search when deleted', async ({
  request,
}) => {
  const { db, games, gameOrganizations, gameTags, organizations, tags } =
    await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const id = unique();
  const [game] = await db
    .insert(games)
    .values({ name: `Lanternfall ${id}` })
    .returning();
  const [tag] = await db
    .insert(tags)
    .values({ name: `cozyhorror${id}` })
    .returning();
  const [studio] = await db
    .insert(organizations)
    .values({ name: `Wickerworks${id}`, type: 'studio' })
    .returning();
  try {
    await db.insert(gameTags).values({ gameId: game.id, tagId: tag.id });
    await db
      .insert(gameOrganizations)
      .values({ gameId: game.id, organizationId: studio.id });
    expect(await found(request, `cozyhorror${id}`)).toContain(game.name);
    expect(await found(request, `wickerworks${id}`)).toContain(game.name);

    // Renaming the studio reindexes its games.
    await db
      .update(organizations)
      .set({ name: `Reedworks${id}` })
      .where(eq(organizations.id, studio.id));
    expect(await found(request, `reedworks${id}`)).toContain(game.name);
    expect(await found(request, `wickerworks${id}`)).not.toContain(game.name);

    await db
      .update(games)
      .set({ deletedAt: new Date() })
      .where(eq(games.id, game.id));
    expect(await found(request, `cozyhorror${id}`)).not.toContain(game.name);
  } finally {
    await db.delete(games).where(eq(games.id, game.id));
    await db.delete(tags).where(eq(tags.id, tag.id));
    await db.delete(organizations).where(eq(organizations.id, studio.id));
  }
});

test('places are found by city, and by country in English or French', async ({
  request,
}) => {
  const { db, organizations } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const id = unique();
  const [studio] = await db
    .insert(organizations)
    .values({
      name: `Pixelhaus${id}`,
      type: 'studio',
      countryCode: 'DE',
      city: `Kölnberg${id}`,
    })
    .returning();
  try {
    expect(await found(request, `pixelhaus${id} germany`)).toContain(
      studio.name
    );
    expect(await found(request, `pixelhaus${id} allemagne`)).toContain(
      studio.name
    );
    expect(await found(request, `kolnberg${id}`)).toContain(studio.name);
    expect(await found(request, `pixelhaus${id} france`)).not.toContain(
      studio.name
    );
  } finally {
    await db.delete(organizations).where(eq(organizations.id, studio.id));
  }
});

test('upcoming events come before past ones', async ({ request }) => {
  const { db, events } = await import('./db.js');
  const { inArray } = await import('drizzle-orm');
  const word = `jamboree${unique()}`;
  const day = 24 * 60 * 60 * 1000;
  const at = (offset) => ({
    startsAt: new Date(Date.now() + offset),
    endsAt: new Date(Date.now() + offset + day),
  });
  // The past one's name is the query itself, which would otherwise rank first.
  const [past, upcoming] = await db
    .insert(events)
    .values([
      { name: word, ...at(-60 * day) },
      { name: `The ${word} returns`, ...at(30 * day) },
    ])
    .returning();
  try {
    const { event: events } = await searchData(request, word);
    expect(names(events)).toEqual([upcoming.name, past.name]);
  } finally {
    await db.delete(events).where(inArray(events.id, [past.id, upcoming.id]));
  }
});

// #306: the results page, and the header's suggestions.
test('the results page counts each kind, says why a result matched, and shows one kind', async ({
  page,
}) => {
  const { db, games, gameOrganizations, organizations } =
    await import('./db.js');
  const { eq, inArray } = await import('drizzle-orm');
  const word = `glimmerfen${unique()}`;
  const [studio] = await db
    .insert(organizations)
    .values({ name: `${word} Works`, type: 'studio' })
    .returning();
  const [named, made] = await db
    .insert(games)
    .values([{ name: `${word} Saga` }, { name: `Mirelight ${word.slice(-5)}` }])
    .returning();
  await db
    .insert(gameOrganizations)
    .values({ gameId: made.id, organizationId: studio.id });
  try {
    await page.goto(`/search?q=${word}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `Results for “${word}”`
    );
    const tabs = page.getByRole('navigation', { name: 'Kinds of results' });
    await expect(tabs.getByRole('link', { name: 'All 3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(tabs.getByRole('link', { name: 'Games 2' })).toBeVisible();
    await expect(tabs.getByRole('link', { name: 'Events 0' })).toBeVisible();

    // The game found by its studio says so; the one found by name doesn't.
    const results = page
      .getByRole('region', { name: /Games/ })
      .getByRole('listitem');
    await expect(results).toHaveCount(2);
    await expect(results.filter({ hasText: made.name })).toContainText(
      `By: ${studio.name}`
    );
    await expect(results.filter({ hasText: named.name })).not.toContainText(
      'By:'
    );

    await tabs.getByRole('link', { name: 'Studios 1' }).click();
    await expect(page).toHaveURL(`/search?q=${word}&kind=studio`);
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('listitem')).toContainText(studio.name);
  } finally {
    await db.delete(games).where(inArray(games.id, [named.id, made.id]));
    await db.delete(organizations).where(eq(organizations.id, studio.id));
  }
});

test('the header box suggests matches, and Enter shows every result', async ({
  page,
}) => {
  const { db, games } = await import('./db.js');
  const { eq } = await import('drizzle-orm');
  const word = `quillmoor${unique()}`;
  const [game] = await db
    .insert(games)
    .values({ name: `${word} Tales` })
    .returning();
  try {
    await page.goto('/about');
    const box = page
      .getByRole('combobox', { name: 'Search' })
      .locator('visible=true');
    await box.pressSequentially(word.slice(0, 12));
    await page.getByRole('option', { name: new RegExp(game.name) }).click();
    await expect(page).toHaveURL(new RegExp(`/game/`));
    await expect(page).toHaveTitle(new RegExp(game.name));

    await box.fill('');
    await box.pressSequentially(word);
    await expect(
      page.getByRole('option', { name: `See all results for “${word}”` })
    ).toBeVisible();
    await box.press('Enter');
    await expect(page).toHaveURL(`/search?q=${word}`);
    await expect(page.getByRole('option')).toHaveCount(0);
  } finally {
    await db.delete(games).where(eq(games.id, game.id));
  }
});
