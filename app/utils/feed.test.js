import { describe, expect, it } from 'vitest';

import { atomFeed } from './feed';

describe('atomFeed', () => {
  const xml = atomFeed({
    title: 'New games',
    self: 'https://x/games/feed.xml',
    site: 'https://x/games',
    entries: [
      { title: 'Héros & <Co>', url: 'https://x/game/heros', summary: '**Great** game', published: new Date('2026-10-02T00:00:00Z') },
    ],
  });

  it('escapes titles and links each entry', () => {
    expect(xml).toContain('<title>Héros &amp; &lt;Co&gt;</title>');
    expect(xml).toContain('<id>https://x/game/heros</id>');
    expect(xml).toContain('<summary>Great game</summary>');
  });

  it('is updated when its latest entry was', () => {
    expect(xml).toContain('<updated>2026-10-02T00:00:00.000Z</updated>');
  });
});
