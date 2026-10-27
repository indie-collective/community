import { describe, expect, it } from 'vitest';

import { shareLinks } from './share';

describe('shareLinks', () => {
  const links = shareLinks({ url: 'https://community.indieco.xyz/game/héros-&-co', text: 'Héros & Co on Indie Collective' });

  it('puts the text and the URL in the Bluesky post', () => {
    const text = new URL(links.bluesky).searchParams.get('text');
    expect(text).toBe('Héros & Co on Indie Collective https://community.indieco.xyz/game/héros-&-co');
  });

  it('shares to the given Mastodon server', () => {
    expect(links.mastodon('mastodon.social')).toMatch(/^https:\/\/mastodon\.social\/share\?text=/);
  });

  it('escapes the URL for the others', () => {
    for (const network of ['linkedin', 'facebook']) {
      const url = [...new URL(links[network]).searchParams.values()][0];
      expect(url).toBe('https://community.indieco.xyz/game/héros-&-co');
    }
    expect(new URL(links.x).searchParams.get('text')).toBe('Héros & Co on Indie Collective');
  });
});
