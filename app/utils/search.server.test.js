import { describe, expect, it } from 'vitest';

import { getFullTextSearchQuery } from './search.server';

describe('getFullTextSearchQuery', () => {
  it('turns words into a prefix query matching all of them', () => {
    expect(getFullTextSearchQuery('indie conf')).toBe('indie:*&conf:*');
  });

  // #176: a missing or blank query crashed pg-tsquery, so /search was a 500.
  it.each([null, undefined, '', '   ', '!!!', '&'])('returns null for %j, which has nothing to search', (input) => {
    expect(getFullTextSearchQuery(input)).toBeNull();
  });
});
