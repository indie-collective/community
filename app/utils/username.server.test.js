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

const uniqueViolation = () => Object.assign(new Error('Unique constraint failed'), { code: 'P2002', meta: { target: ['username'] } });

function fakeDb(taken = []) {
  const usernames = new Set(taken);
  return {
    person: {
      findUnique: vi.fn(async ({ where: { username } }) => (usernames.has(username) ? { username } : null)),
      create: vi.fn(async ({ data }) => {
        if (usernames.has(data.username)) throw uniqueViolation();
        usernames.add(data.username);
        return { id: 'p1', ...data };
      }),
    },
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
    db.person.findUnique.mockResolvedValueOnce(null);
    db.person.create.mockRejectedValueOnce(uniqueViolation());
    const { username } = await createPerson(db, { username: 'member', first_name: 'Jean' });
    expect(username).toMatch(/^jean\d{4}$/);
    expect(db.person.create).toHaveBeenCalledTimes(2);
  });

  it('rethrows other errors, such as a taken email', async () => {
    const db = fakeDb();
    db.person.create.mockRejectedValueOnce(Object.assign(new Error('email'), { code: 'P2002', meta: { target: ['email'] } }));
    await expect(createPerson(db, { username: 'member', first_name: 'Jean' })).rejects.toThrow('email');
  });
});
