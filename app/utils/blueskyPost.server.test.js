import { afterEach, describe, expect, it, vi } from 'vitest';

import { announceOnBluesky, postRecord } from './blueskyPost.server';

const post = {
  text: 'New game: Héros & Co',
  url: 'https://community.indieco.xyz/game/heros-co',
  title: 'Héros & Co',
  description: 'A game.',
};

describe('postRecord', () => {
  it('ends with the link, clickable at its UTF-8 bytes, and a link card', () => {
    const record = postRecord(post, new Date('2026-10-11T12:00:00Z'));
    expect(record.text).toBe(`New game: Héros & Co\n\n${post.url}`);
    const { byteStart, byteEnd } = record.facets[0].index;
    const bytes = new TextEncoder().encode(record.text);
    expect(new TextDecoder().decode(bytes.slice(byteStart, byteEnd))).toBe(post.url);
    expect(record.embed.external).toEqual({ uri: post.url, title: 'Héros & Co', description: 'A game.' });
    expect(record.createdAt).toBe('2026-10-11T12:00:00.000Z');
  });

  it('cuts a long line to fit 300 graphemes, keeping the link whole', () => {
    const record = postRecord({ ...post, text: `New game: ${'🎮'.repeat(400)}` });
    const graphemes = [...new Intl.Segmenter().segment(record.text)].length;
    expect(graphemes).toBeLessThanOrEqual(300);
    expect(record.text.endsWith(post.url)).toBe(true);
    expect(record.text).toContain('…');
  });
});

describe('announceOnBluesky', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('signs in with the app password and posts to the account', async () => {
    vi.stubEnv('BLUESKY_IDENTIFIER', 'indieco.xyz');
    vi.stubEnv('BLUESKY_APP_PASSWORD', 'app-password');
    vi.stubEnv('BLUESKY_SERVICE', 'https://pds.test');
    const fetchMock = vi.fn(async (url) =>
      Response.json(url.endsWith('createSession') ? { did: 'did:plc:ic', accessJwt: 'token' } : { uri: 'at://x' })
    );
    vi.stubGlobal('fetch', fetchMock);

    await announceOnBluesky(post);

    const [[sessionUrl, sessionInit], [recordUrl, recordInit]] = fetchMock.mock.calls;
    expect(sessionUrl).toBe('https://pds.test/xrpc/com.atproto.server.createSession');
    expect(JSON.parse(sessionInit.body)).toEqual({ identifier: 'indieco.xyz', password: 'app-password' });
    expect(recordUrl).toBe('https://pds.test/xrpc/com.atproto.repo.createRecord');
    expect(recordInit.headers.Authorization).toBe('Bearer token');
    const body = JSON.parse(recordInit.body);
    expect(body).toMatchObject({ repo: 'did:plc:ic', collection: 'app.bsky.feed.post' });
    expect(body.record.text).toContain(post.url);
  });

  it('skips when the account is not configured, and never throws', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await announceOnBluesky(post);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubEnv('BLUESKY_IDENTIFIER', 'indieco.xyz');
    vi.stubEnv('BLUESKY_APP_PASSWORD', 'wrong');
    vi.stubEnv('BLUESKY_SERVICE', 'https://pds.test');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 401 })));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(announceOnBluesky(post)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith('Failed to announce on Bluesky', expect.any(Error));
    warn.mockRestore();
    error.mockRestore();
  });
});
