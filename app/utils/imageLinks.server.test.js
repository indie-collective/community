import { afterEach, describe, expect, it, vi } from 'vitest';

import getImageLinks from './imageLinks.server';

describe('getImageLinks', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('serves uploaded images and their thumbnails from the CDN', () => {
    vi.stubEnv('CDN_HOST', 'cdn.indieco.test');
    expect(getImageLinks({ id: 'i1', image_file: { name: '2026.png' } })).toEqual({
      id: 'i1',
      url: 'https://cdn.indieco.test/2026.png',
      thumbnail_url: 'https://cdn.indieco.test/thumb_2026.png',
    });
  });

  it('uses absolute URLs as they are, for both sizes', () => {
    const name = 'https://images.example.com/cover.jpg';
    expect(getImageLinks({ id: 'i2', image_file: { name } })).toEqual({
      id: 'i2',
      url: name,
      thumbnail_url: name,
    });
  });
});
