import { beforeEach, describe, expect, it, vi } from 'vitest';

const put = vi.fn(async () => {});
vi.mock('cloudflare:workers', () => ({ env: { IMAGES: { put: (...args) => put(...args) } } }));
const createImage = vi.fn(async () => 'image-1');
vi.mock('../data/images.server', () => ({ createImage: (...args) => createImage(...args) }));

const { parseFormWithUploads } = await import('./createUploadHandler.server');

const request = (entries) => {
  const form = new FormData();
  for (const [name, value, filename] of entries) {
    if (filename !== undefined) form.append(name, value, filename);
    else form.append(name, value);
  }
  return new Request('http://localhost/profile/edit', { method: 'POST', body: form });
};
const png = (bytes) => new Blob([bytes], { type: 'image/png' });
const stored = async (call) => ({ key: call[0], body: await new Response(call[1]).text(), type: call[2].httpMetadata.contentType });

// #170: replaces Remix's unstable_parseMultipartFormData, which React Router 7
// dropped; every upload-capable form depends on it.
describe('parseFormWithUploads', () => {
  beforeEach(() => {
    put.mockClear();
    createImage.mockClear();
  });

  it('passes text fields through unchanged', async () => {
    const data = await parseFormWithUploads(
      request([['firstName', 'Jean-Michel'], ['about', 'Makes games.']]),
      ['avatar']
    );
    expect(data.get('firstName')).toBe('Jean-Michel');
    expect(data.get('about')).toBe('Makes games.');
  });

  it('turns an empty file input into an empty string without uploading', async () => {
    const data = await parseFormWithUploads(request([['avatar', new Blob([]), '']]), ['avatar']);
    expect(data.get('avatar')).toBe('');
    expect(put).not.toHaveBeenCalled();
  });

  it('stores the image and its thumbnail, and records the key and size', async () => {
    const data = await parseFormWithUploads(
      request([
        ['avatar', png('image'), 'me.PNG'],
        ['avatar_thumb', new Blob(['thumb'], { type: 'image/webp' }), 'thumb.webp'],
        ['avatar_width', '800'],
        ['avatar_height', '600'],
      ]),
      ['avatar']
    );
    expect([...data.keys()]).toEqual(['avatar']);
    expect(data.get('avatar')).toBe('image-1');
    const [image, thumb] = await Promise.all(put.mock.calls.map(stored));
    expect(image).toMatchObject({ key: expect.stringMatching(/^\d+-[0-9a-f]{8}\.png$/), body: 'image', type: 'image/png' });
    expect(thumb).toEqual({ key: `thumb_${image.key}`, body: 'thumb', type: 'image/webp' });
    expect(createImage).toHaveBeenCalledWith({ name: image.key, width: 800, height: 600 });
  });

  it('uses the image as its own thumbnail when none came', async () => {
    await parseFormWithUploads(request([['avatar', png('image'), 'me.png']]), ['avatar']);
    const [image, thumb] = await Promise.all(put.mock.calls.map(stored));
    expect(thumb).toMatchObject({ key: `thumb_${image.key}`, body: 'image' });
    expect(createImage).toHaveBeenCalledWith({ name: image.key, width: null, height: null });
  });

  it('pairs every file of a multiple input with its own thumbnail', async () => {
    const data = await parseFormWithUploads(
      request([
        ['images', png('a'), 'a.png'],
        ['images_thumb', png('ta'), 'ta.png'],
        ['images_width', '1'],
        ['images_height', '2'],
        ['images', png('b'), 'b.png'],
        ['images_thumb', png('tb'), 'tb.png'],
        ['images_width', '3'],
        ['images_height', '4'],
      ]),
      ['images']
    );
    expect(data.getAll('images')).toEqual(['image-1', 'image-1']);
    const bodies = await Promise.all(put.mock.calls.map(stored));
    expect(bodies.map((b) => b.body).sort()).toEqual(['a', 'b', 'ta', 'tb']);
    expect(createImage.mock.calls.map(([{ width, height }]) => [width, height])).toEqual([[1, 2], [3, 4]]);
  });

  it('leaves files that are not upload inputs as files', async () => {
    const data = await parseFormWithUploads(request([['attachment', new Blob(['x']), 'x.txt']]), ['avatar']);
    expect(data.get('attachment')).toBeInstanceOf(File);
    expect(put).not.toHaveBeenCalled();
  });
});
