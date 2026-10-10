import { afterEach, describe, expect, it } from 'vitest';

import getImageLinks from './imageLinks.server';

const image = { id: 'i1', image_file: { name: 'a.png' } };

describe('getImageLinks', () => {
  afterEach(() => {
    delete process.env.CDN_HOST;
  });

  it('serves from /images without a CDN_HOST', () => {
    expect(getImageLinks(image)).toEqual({ id: 'i1', url: '/images/a.png', thumbnail_url: '/images/thumb_a.png' });
  });

  it.each(['cdn.indieco.xyz', 'https://cdn.indieco.xyz', 'https://cdn.indieco.xyz/'])(
    'serves from CDN_HOST %s',
    (host) => {
      process.env.CDN_HOST = host;
      expect(getImageLinks(image).thumbnail_url).toBe('https://cdn.indieco.xyz/thumb_a.png');
    }
  );

  it('keeps images hosted elsewhere', () => {
    const url = 'https://picsum.photos/1.jpg';
    expect(getImageLinks({ id: 'i2', image_file: { name: url } })).toMatchObject({ url, thumbnail_url: url });
  });
});
