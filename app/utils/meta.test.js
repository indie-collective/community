import { describe, expect, it } from 'vitest';

import { DEFAULT_DESCRIPTION, gameShareImage, pageMeta, shareImage, summarize } from './meta';

const matches = [{ id: 'root', data: { origin: 'https://community.test' } }];
const tag = (tags, key) => tags.find((t) => t.name === key || t.property === key)?.content;

describe('summarize', () => {
  it('collapses whitespace and strips Markdown', () => {
    expect(summarize('# A **bold**  game\n\nwith [a link](https://x.test) and `code`.')).toBe('A bold game with a link and code.');
  });

  it('cuts long text at a word boundary, at most 160 characters', () => {
    const text = 'word '.repeat(60);
    const result = summarize(text);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('word…')).toBe(true);
  });

  // #196: `${about}.` gave "." or "null." for empty abouts.
  it.each([null, undefined, '', '   ', '.', '…', '- *'])('treats %j as empty', (input) => {
    expect(summarize(input)).toBe('');
  });
});

describe('pageMeta', () => {
  it('builds the whole set, with absolute URL and image', () => {
    const tags = pageMeta(matches, { title: 'Games', description: 'All the games.', path: '/games' });
    expect(tags[0]).toEqual({ title: 'Games' });
    expect(tag(tags, 'description')).toBe('All the games.');
    expect(tag(tags, 'og:title')).toBe('Games');
    expect(tag(tags, 'og:description')).toBe('All the games.');
    expect(tag(tags, 'og:type')).toBe('website');
    expect(tag(tags, 'og:site_name')).toBe('Indie Collective');
    expect(tag(tags, 'og:url')).toBe('https://community.test/games');
    expect(tag(tags, 'og:image')).toBe('https://community.test/og-default.png');
    expect(tag(tags, 'twitter:card')).toBe('summary_large_image');
    expect(tag(tags, 'twitter:site')).toBe('@IndieColle');
    expect(tag(tags, 'twitter:image')).toBe('https://community.test/og-default.png');
  });

  it("uses the page's own image, made absolute when relative", () => {
    expect(tag(pageMeta(matches, { title: 'A', image: 'https://cdn.test/a.png' }), 'og:image')).toBe('https://cdn.test/a.png');
    expect(tag(pageMeta(matches, { title: 'A', image: '/a.png' }), 'og:image')).toBe('https://community.test/a.png');
  });

  it('can share a shorter title than the page title', () => {
    const tags = pageMeta(matches, { title: 'Celeste - Games', shareTitle: 'Celeste' });
    expect(tags[0]).toEqual({ title: 'Celeste - Games' });
    expect(tag(tags, 'og:title')).toBe('Celeste');
    expect(tag(tags, 'twitter:title')).toBe('Celeste');
  });

  it('falls back to the site description, never an empty one', () => {
    expect(tag(pageMeta(matches, { title: 'A', description: '.' }), 'description')).toBe(DEFAULT_DESCRIPTION);
  });

  it('leaves out what it cannot make absolute, without an origin', () => {
    const tags = pageMeta([], { title: 'A', path: '/a' });
    expect(tag(tags, 'og:url')).toBeUndefined();
    expect(tag(tags, 'og:image')).toBeUndefined();
    expect(tag(tags, 'twitter:card')).toBe('summary');
  });

  // #333
  it('shares the image size and alt text when known', () => {
    const tags = pageMeta(matches, {
      title: 'A',
      image: { url: 'https://cdn.test/a.jpg', width: 1920, height: 1080, alt: 'Celeste' },
    });
    expect(tag(tags, 'og:image')).toBe('https://cdn.test/a.jpg');
    expect(tag(tags, 'og:image:width')).toBe('1920');
    expect(tag(tags, 'og:image:height')).toBe('1080');
    expect(tag(tags, 'og:image:alt')).toBe('Celeste');
    expect(tag(tags, 'twitter:image:alt')).toBe('Celeste');
    expect(tag(tags, 'twitter:card')).toBe('summary_large_image');
  });

  it('leaves out an unknown size', () => {
    const tags = pageMeta(matches, { title: 'A', image: { url: '/a.png', width: null, height: null } });
    expect(tag(tags, 'og:image')).toBe('https://community.test/a.png');
    expect(tag(tags, 'og:image:width')).toBeUndefined();
    expect(tag(tags, 'og:image:alt')).toBeUndefined();
  });

  it('gives protocol-relative images (IGDB) https', () => {
    const tags = pageMeta(matches, { title: 'A', image: '//images.igdb.com/a.jpg' });
    expect(tag(tags, 'og:image')).toBe('https://images.igdb.com/a.jpg');
  });

  it('uses a small card for square images, such as logos', () => {
    const tags = pageMeta(matches, { title: 'A', image: { url: '/logo.png', width: 512, height: 512 } });
    expect(tag(tags, 'twitter:card')).toBe('summary');
  });

  it('falls back to the default image for an image without a URL', () => {
    expect(tag(pageMeta(matches, { title: 'A', image: {} }), 'og:image')).toBe('https://community.test/og-default.png');
  });
});

describe('gameShareImage', () => {
  const uploaded = { url: 'https://cdn.test/a.jpg', thumbnail_url: 'https://cdn.test/thumb_a.webp', width: 1920, height: 1080 };
  const igdb_game = { screenshots: [{ url: '//images.igdb.com/igdb/image/upload/t_thumb/sc1.jpg' }] };

  it("uses the first uploaded image, full size, over IGDB's", () => {
    expect(gameShareImage({ name: 'Celeste', game_image: [{ image: uploaded }], igdb_game })).toEqual({
      url: 'https://cdn.test/a.jpg',
      width: 1920,
      height: 1080,
      alt: 'Celeste',
    });
  });

  it('falls back to the first IGDB screenshot, at share size', () => {
    expect(gameShareImage({ name: 'Celeste', game_image: [], igdb_game })).toEqual({
      url: '//images.igdb.com/igdb/image/upload/t_screenshot_huge/sc1.jpg',
      width: 1280,
      height: 720,
      alt: 'Celeste',
    });
  });

  it('has none without images', () => {
    expect(gameShareImage({ name: 'Celeste', game_image: [], igdb_game: { screenshots: [] } })).toBeUndefined();
    expect(gameShareImage({ name: 'Celeste' })).toBeUndefined();
  });
});

describe('shareImage', () => {
  it('shares an uploaded image full size, or nothing', () => {
    expect(shareImage({ url: '/a.png', thumbnail_url: '/thumb_a.png', width: 10, height: 5 }, 'A')).toEqual({
      url: '/a.png',
      width: 10,
      height: 5,
      alt: 'A',
    });
    expect(shareImage(null, 'A')).toBeUndefined();
  });
});
