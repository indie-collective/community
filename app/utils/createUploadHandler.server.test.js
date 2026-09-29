import { beforeEach, describe, expect, it, vi } from 'vitest';

const putObject = vi.fn(() => ({ promise: async () => ({ ETag: 'etag', VersionId: 'v1' }) }));
vi.mock('aws-sdk', () => ({ default: { S3: vi.fn(function S3() { this.putObject = putObject; }) } }));
vi.mock('jimp', () => ({
  Jimp: {
    fromBuffer: vi.fn(async () => ({
      bitmap: { width: 800, height: 600 },
      mime: 'image/png',
      resize() {
        return { getBuffer: () => Buffer.from('thumb') };
      },
    })),
  },
}));
const createImage = vi.fn(async () => ({ id: 'image-1' }));
vi.mock('./db.server', () => ({ db: { image: { create: (...args) => createImage(...args) } } }));

const { parseFormWithUploads } = await import('./createUploadHandler.server');

const request = (entries) => {
  const form = new FormData();
  for (const [name, value, filename] of entries) {
    if (filename !== undefined) form.append(name, value, filename);
    else form.append(name, value);
  }
  return new Request('http://localhost/profile/edit', { method: 'POST', body: form });
};

// #170: replaces Remix's unstable_parseMultipartFormData, which React Router 7
// dropped; every upload-capable form depends on it.
describe('parseFormWithUploads', () => {
  beforeEach(() => {
    putObject.mockClear();
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
    const data = await parseFormWithUploads(
      request([['avatar', new Blob([]), '']]),
      ['avatar']
    );
    expect(data.get('avatar')).toBe('');
    expect(putObject).not.toHaveBeenCalled();
  });

  it('uploads a named file input and replaces it with the new image id', async () => {
    const data = await parseFormWithUploads(
      request([['avatar', new Blob(['png-bytes'], { type: 'image/png' }), 'me.png']]),
      ['avatar']
    );
    expect(data.get('avatar')).toBe('image-1');
    expect(putObject).toHaveBeenCalledTimes(2); // image + thumbnail
    expect(putObject.mock.calls[0][0].Key).toMatch(/\.png$/);
    expect(createImage).toHaveBeenCalledOnce();
  });

  it('uploads every file of a multiple input', async () => {
    const data = await parseFormWithUploads(
      request([
        ['images', new Blob(['a'], { type: 'image/png' }), 'a.png'],
        ['images', new Blob(['b'], { type: 'image/png' }), 'b.png'],
      ]),
      ['images']
    );
    expect(data.getAll('images')).toEqual(['image-1', 'image-1']);
    expect(createImage).toHaveBeenCalledTimes(2);
  });

  it('leaves files that are not upload inputs as files', async () => {
    const data = await parseFormWithUploads(
      request([['attachment', new Blob(['x']), 'x.txt']]),
      ['avatar']
    );
    expect(data.get('attachment')).toBeInstanceOf(File);
    expect(putObject).not.toHaveBeenCalled();
  });
});
