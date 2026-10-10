import { expect, test } from './helpers';

// #176: the autocomplete endpoints crashed on a missing or blank query.
for (const endpoint of ['/search-game', '/search-org', '/search-event']) {
  test(`${endpoint} answers an empty query without crashing`, async ({ request }) => {
    for (const query of ['', '?q=', '?q=%20%20']) {
      const response = await request.get(`${endpoint}${query}`);
      expect(response.status(), `${endpoint}${query}`).toBe(200);
    }
  });
}

// The autocomplete endpoints find what they're asked for. /search-event
// read `url`, which didn't exist, so every search failed with "Something
// went wrong".
for (const [endpoint, table] of [['/search-game', 'games'], ['/search-org', 'organizations'], ['/search-event', 'events']]) {
  test(`${endpoint} finds a record by a word of its name`, async ({ request }) => {
    const schema = await import('./db.js');
    const { searchWords } = await import('../app/db/search.js');
    // Seeded names are random and share words ("Group", "Inc"), and pickers
    // show ten matches: take a word of a name that at most five records have.
    const rows = await schema.db
      .select({ name: schema[table].name, searchText: schema[table].searchText })
      .from(schema[table]);
    // Records with a word starting with this one, as search matches them.
    const sharing = (word) => rows.filter(({ searchText }) => searchWords(searchText).some((w) => w.startsWith(word))).length;
    let record;
    let word;
    for (const row of rows) {
      word = searchWords(row.name).find((w) => w.length >= 4 && sharing(w) <= 5);
      if (word) {
        record = row;
        break;
      }
    }

    const response = await request.get(`${endpoint}.data?q=${encodeURIComponent(word)}`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain('Something went wrong');
    expect(body).toContain(record.name);
  });
}
