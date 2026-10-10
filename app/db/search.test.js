import { describe, expect, it } from 'vitest';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { matchesSearch, searchWords } from './search';

const dialect = new SQLiteSyncDialect();
const render = (condition) => dialect.sqlToQuery(condition);

describe('searchWords', () => {
  it('splits normalised words, ignoring punctuation and operators', () => {
    expect(searchWords('  Jéu & Co!  ')).toEqual(['jeu', 'co']);
    expect(searchWords('&|!')).toEqual([]);
    expect(searchWords(null)).toEqual([]);
  });
});

describe('matchesSearch', () => {
  const column = sql.raw('search_text');

  it('is null with nothing to search', () => {
    expect(matchesSearch(column, ' ')).toBeNull();
  });

  it('matches every word at the start of a word', () => {
    expect(render(matchesSearch(column, 'Cél 50%'))).toMatchObject({
      sql: "((' ' || search_text) like ? escape '\\' and (' ' || search_text) like ? escape '\\')",
      params: ['% cel%', '% 50%'],
    });
    expect(render(matchesSearch(column, 'a_b')).params).toEqual([
      '% a%',
      '% b%',
    ]);
    expect(
      render(matchesSearch(column, 'x', { anywhere: true })).params
    ).toEqual(['%x%']);
  });
});
