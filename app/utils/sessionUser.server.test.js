import { describe, expect, it } from 'vitest';

import toSessionUser from './sessionUser.server';

// A `person` row as sign-in, sign-up and profile updates load it.
const person = {
  id: 'p1',
  username: 'member',
  first_name: 'Jean-Michel',
  last_name: 'Jarre',
  about: 'Hello',
  email: 'member@example.test',
  isAdmin: false,
  password_hash: '$2a$06$not-a-real-hash',
  discord_id: '123',
  github_id: null,
  steam_id: null,
  avatar_id: 'img1',
  avatar_oauth: null,
  created_at: new Date('2020-01-01'),
  updated_at: new Date('2020-01-02'),
};

describe('toSessionUser', () => {
  it('keeps only what the app reads from the session', () => {
    expect(toSessionUser({ ...person, avatar: 'https://cdn.test/thumb_a.png' })).toEqual({
      id: 'p1',
      username: 'member',
      first_name: 'Jean-Michel',
      email: 'member@example.test',
      isAdmin: false,
      avatar: 'https://cdn.test/thumb_a.png',
    });
  });

  // #180: the cookie is signed, not encrypted, so anyone holding it can read it.
  it('never carries credentials, provider ids or profile text', () => {
    const user = toSessionUser(person);
    for (const key of ['password_hash', 'discord_id', 'github_id', 'steam_id', 'about', 'last_name', 'created_at']) {
      expect(user).not.toHaveProperty(key);
    }
  });

  // #156: rights come from the database, not from Discord.
  it('drops the Discord guild membership older sessions held', () => {
    expect(toSessionUser({ ...person, isGuildMember: true })).not.toHaveProperty('isGuildMember');
  });

  it('stores the avatar as its thumbnail URL', () => {
    expect(toSessionUser({ ...person, avatar: { thumbnail_url: 'https://cdn.test/thumb_b.png' } }).avatar).toBe(
      'https://cdn.test/thumb_b.png'
    );
    expect(toSessionUser({ ...person, avatar: undefined }).avatar).toBeNull();
  });

  it('coerces a missing admin flag to false', () => {
    expect(toSessionUser({ id: 'p1' }).isAdmin).toBe(false);
  });

  it('passes empty values through', () => {
    expect(toSessionUser(null)).toBeNull();
    expect(toSessionUser(undefined)).toBeUndefined();
  });
});
