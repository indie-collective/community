import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkBlueskyHandle, normalizeBlueskyHandle } from './bluesky.server';

describe('normalizeBlueskyHandle', () => {
  it.each([
    ['@studio.bsky.social', 'studio.bsky.social'],
    ['  Studio.BSKY.social ', 'studio.bsky.social'],
    ['https://bsky.app/profile/studio.example.com', 'studio.example.com'],
    ['bsky.app/profile/@studio.bsky.social/', 'studio.bsky.social'],
    ['', ''],
    [null, ''],
  ])('%j → %j', (input, expected) => {
    expect(normalizeBlueskyHandle(input)).toBe(expected);
  });
});

describe('checkBlueskyHandle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns null for an empty field', async () => {
    expect(await checkBlueskyHandle('  ')).toBeNull();
  });

  it('accepts a handle that resolves', async () => {
    const fetchMock = vi.fn(async () => Response.json({ did: 'did:plc:abc' }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await checkBlueskyHandle('@Studio.bsky.social')).toBe('studio.bsky.social');
    expect(String(fetchMock.mock.calls[0][0])).toContain('com.atproto.identity.resolveHandle?handle=studio.bsky.social');
  });

  it('rejects a malformed or unknown handle with a readable message', async () => {
    await expect(checkBlueskyHandle('not a handle')).rejects.toThrow('"not a handle" isn\'t a Bluesky handle');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'InvalidRequest' }, { status: 400 })));
    await expect(checkBlueskyHandle('nobody.bsky.social')).rejects.toThrow('No Bluesky account is called "nobody.bsky.social"');
  });
});
