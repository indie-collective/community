import { describe, expect, it } from 'vitest';

import { assignSlugs, eventSlug, firstFreeSlug, gamePath, isUuid, slugify } from './slug';

describe('slugify', () => {
  it.each([
    ['Celeste', 'celeste'],
    ['Héros & Co.', 'heros-co'],
    ["O'Conner - MacGyver Conference", 'o-conner-macgyver-conference'],
    ['  Stunfest 2026  ', 'stunfest-2026'],
    ['ゲーム', 'untitled'],
    ['', 'untitled'],
  ])('%j → %j', (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it('cuts long names at a word, within 80 characters', () => {
    const slug = slugify('a very long game name '.repeat(10));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug).toMatch(/^[a-z-]+[a-z]$/);
  });
});

describe('eventSlug', () => {
  it('adds the year when the name lacks it', () => {
    expect(eventSlug('Global Game Jam', '2025-01-24T17:00:00Z')).toBe('global-game-jam-2025');
    expect(eventSlug('Stunfest 2026', '2026-05-20T08:00:00Z')).toBe('stunfest-2026');
  });
});

describe('firstFreeSlug', () => {
  it('numbers duplicates', () => {
    expect(firstFreeSlug('celeste', new Set())).toBe('celeste');
    expect(firstFreeSlug('celeste', new Set(['celeste', 'celeste-2']))).toBe('celeste-3');
  });
});

describe('paths', () => {
  it('use the slug, or the ID until there is one', () => {
    expect(gamePath({ id: 'x', slug: 'celeste' })).toBe('/game/celeste');
    expect(gamePath({ id: 'x', slug: null })).toBe('/game/x');
  });

  it('tell UUIDs from slugs', () => {
    expect(isUuid('4dd54028-45a9-45a5-84a0-997a85dfd436')).toBe(true);
    expect(isUuid('celeste')).toBe(false);
  });
});

describe('assignSlugs', () => {
  it('gives the oldest record the plain slug, and numbers the others', () => {
    const slugs = assignSlugs([
      { id: 'b', name: 'Celeste', createdAt: '2024-01-01' },
      { id: 'a', name: 'Celeste', createdAt: '2020-01-01' },
      { id: 'c', name: 'Hades', createdAt: '2021-01-01' },
    ]);
    expect(Object.fromEntries(slugs)).toEqual({ a: 'celeste', b: 'celeste-2', c: 'hades' });
  });

  it('avoids slugs already taken, and adds events their year', () => {
    const slugs = assignSlugs([{ id: 'e', name: 'Global Game Jam', startsAt: '2025-01-24' }], {
      event: true,
      taken: new Set(['global-game-jam-2025']),
    });
    expect(slugs.get('e')).toBe('global-game-jam-2025-2');
  });
});
