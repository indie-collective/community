import { describe, expect, it } from 'vitest';

import { DEFAULT_DESCRIPTION, pageMeta, summarize } from './meta';

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
});
