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
