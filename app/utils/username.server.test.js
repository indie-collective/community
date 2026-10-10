import { describe, expect, it, vi } from 'vitest';

import { createPerson, slugifyName } from './username.server';

describe('slugifyName', () => {
  // Same rules as the slugify() SQL function it replaces (#150).
  it.each([
    ['Jean-Michel', 'jean-michel'],
    ['Élodie Ménard', 'elodie-menard'],
    ["O'Brien", 'obrien'],
    ['  --Ünïcödé__ok--  ', 'unicode__ok'],
    ['', ''],
    [null, ''],
  ])('%j → %j', (input, expected) => {
    expect(slugifyName(input)).toBe(expected);
  });
});

// D1's error, wrapped as Drizzle wraps it.
const uniqueViolation = () =>
  new Error('Failed query: insert into "people"', {
    cause: new Error('D1_ERROR: UNIQUE constraint failed: people.username: SQLITE_CONSTRAINT'),
  });

function fakeDb(taken = []) {
  const usernames = new Set(taken);
  return {
    isUsernameTaken: vi.fn(async (username) => usernames.has(username)),
    insert: vi.fn(async (username) => {
      if (usernames.has(username)) throw uniqueViolation();
      usernames.add(username);
      return { id: 'p1', username };
    }),
  };
}

describe('createPerson', () => {
  it('keeps a free username', async () => {
    const db = fakeDb();
    expect((await createPerson(db, { username: 'member', first_name: 'Jean' })).username).toBe('member');
  });

  // The set_default_username() trigger did this in the database.
  it('replaces a taken username with the slugified name and four digits', async () => {
    const db = fakeDb(['member']);
    const { username } = await createPerson(db, { username: 'member', first_name: 'Jean-Michel', last_name: 'Jarre' });
    expect(username).toMatch(/^jean-micheljarre\d{4}$/);
  });

  it('generates one when none is given, within 30 characters', async () => {
    const db = fakeDb();
    const { username } = await createPerson(db, { first_name: 'Bartholomew-Maximilian', last_name: 'Featherstonehaugh' });
    expect(username.length).toBeLessThanOrEqual(30);
    expect(username).toMatch(/^bartholomew-maximilianfeat\d{4}$/);
  });

  it('retries when another sign-up takes the username first', async () => {
    const db = fakeDb();
    db.isUsernameTaken.mockResolvedValueOnce(false);
    db.insert.mockRejectedValueOnce(uniqueViolation());
    const { username } = await createPerson(db, { username: 'member', first_name: 'Jean' });
    expect(username).toMatch(/^jean\d{4}$/);
    expect(db.insert).toHaveBeenCalledTimes(2);
  });

  it('rethrows other errors, such as a taken email', async () => {
    const db = fakeDb();
    db.insert.mockRejectedValueOnce(new Error('Failed query', { cause: new Error('D1_ERROR: UNIQUE constraint failed: people.email') }));
    await expect(createPerson(db, { username: 'member', first_name: 'Jean' })).rejects.toThrow('Failed query');
  });
});
