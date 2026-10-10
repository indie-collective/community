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
    const { like } = await import('drizzle-orm');
    const [record] = await schema.db
      .select({ name: schema[table].name })
      .from(schema[table])
      .where(like(schema[table].name, '% %'))
      .limit(1);
    const word = record.name.split(/\s+/).find((w) => /^[A-Za-z]{4,}$/.test(w)) ?? record.name.split(/\s+/)[0];

    const response = await request.get(`${endpoint}.data?q=${encodeURIComponent(word)}`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain('Something went wrong');
    expect(body).toContain(record.name);
  });
}
