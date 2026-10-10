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

  it('matches every word at the start of a word, as parameters', () => {
    // Only the words are parameters (D1 allows 100 per query).
    expect(render(matchesSearch(column, 'Cél 50%')).params).toEqual(['% cel%', '% 50%']);
    expect(render(matchesSearch(column, 'x', { anywhere: true })).params).toEqual(['%x%']);
  });
});

// Run against SQLite itself: what the condition finds in stored search
// texts (as searchText writes them).
describe('matchesSearch in SQLite', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const { searchText } = await import('./searchText.js');
  const db = new DatabaseSync(':memory:');
  db.exec('create table t (name text, search_text text)');
  const names = ["O'Conner - MacGyver Conference", 'Co-op Quest', 'studio.io', 'Celeste', 'Mancelestial'];
  for (const name of names) {
    db.prepare('insert into t values (?, ?)').run(name, searchText(name));
  }
  const find = (q, options) => {
    const { sql: where, params } = dialect.sqlToQuery(matchesSearch(sql.raw('search_text'), q, options));
    return db.prepare(`select name from t where ${where} order by name`).all(...params).map((row) => row.name);
  };

  it.each([
    ['cel', ['Celeste']],
    ['conner', ["O'Conner - MacGyver Conference"]],
    ['op quest', ['Co-op Quest']],
    ['io', ['studio.io']],
    ['macgyver conf', ["O'Conner - MacGyver Conference"]],
  ])('%j finds %j', (q, found) => {
    expect(find(q)).toEqual(found);
  });

  it('matches anywhere when asked', () => {
    expect(find('celest', { anywhere: true })).toEqual(['Celeste', 'Mancelestial']);
  });
});
