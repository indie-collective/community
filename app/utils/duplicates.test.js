import { describe, expect, it } from 'vitest';

import { nameKey, siteKey, suspectedPairs } from './duplicates';

describe('nameKey', () => {
  it('ignores case, accents, punctuation and filler words', () => {
    expect(nameKey('Studio Héros & Co.')).toBe('heros');
    expect(nameKey('Héros Games')).toBe('heros');
    expect(nameKey('The Game Bakers')).toBe('bakers');
  });

  it('keeps names made only of filler words apart', () => {
    expect(nameKey('The Games Studio')).toBe('');
  });
});

describe('siteKey', () => {
  it('reduces a site to its host', () => {
    expect(siteKey('https://www.heros.fr/about/')).toBe('heros.fr');
    expect(siteKey('heros.fr')).toBe('heros.fr');
  });

  it('keeps the path on shared hosts', () => {
    expect(siteKey('https://store.steampowered.com/app/123/Heros/')).toBe('store.steampowered.com/app/123/heros');
    expect(siteKey('https://heros.itch.io/game')).toBe('heros.itch.io');
    expect(siteKey('https://twitter.com/heros')).not.toBe(siteKey('https://twitter.com/other'));
  });

  it('keeps the path for games, which can share a studio site', () => {
    expect(siteKey('https://heros.fr/game-one', { exact: true })).not.toBe(siteKey('https://heros.fr/game-two', { exact: true }));
    expect(siteKey('https://heros.itch.io/one', { exact: true })).toBe('heros.itch.io/one');
    expect(siteKey('https://www.heros.fr/', { exact: true })).toBe(siteKey('heros.fr', { exact: true }));
  });

  it('is null for what is not a site', () => {
    expect(siteKey('')).toBeNull();
    expect(siteKey('not a url at all')).toBeNull();
  });
});

describe('suspectedPairs', () => {
  it('pairs records by name, site or Bluesky handle, with the reasons', () => {
    const pairs = suspectedPairs([
      { id: '1', name: 'Studio Héros', site: 'https://heros.fr' },
      { id: '2', name: 'Héros Games', site: 'http://www.heros.fr/' },
      { id: '3', name: 'Other', bsky_handle: 'heros.bsky.social' },
      { id: '4', name: 'Another', bsky_handle: 'Heros.bsky.social' },
      { id: '5', name: 'Unrelated', site: 'https://store.steampowered.com/app/9' },
    ]);
    expect(pairs).toEqual([
      { a: '1', b: '2', reasons: ['same name', 'same website'] },
      { a: '3', b: '4', reasons: ['same Bluesky'] },
    ]);
  });

  it('pairs events with the same name close together, or on the same day in the same city', () => {
    const pairs = suspectedPairs(
      [
        { id: 'a', name: 'GameDev Meetup', starts_at: '2026-03-01T18:00:00Z', city: 'Lyon' },
        { id: 'b', name: 'Gamedev meetup', starts_at: '2026-03-02T18:00:00Z', city: 'Lyon' },
        { id: 'c', name: 'GameDev Meetup', starts_at: '2026-06-01T18:00:00Z', city: 'Lyon' },
        { id: 'd', name: 'Indie Night', starts_at: '2026-06-01T20:00:00Z', city: 'lyon' },
      ],
      { events: true }
    );
    expect(pairs).toEqual([
      { a: 'a', b: 'b', reasons: ['same name'] },
      { a: 'c', b: 'd', reasons: ['same day and city'] },
    ]);
  });
});
