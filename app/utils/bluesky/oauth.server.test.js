import { JoseKey } from '@atproto/jwk-jose';
import { describe, expect, it, vi } from 'vitest';

const kv = vi.hoisted(() => new Map());
vi.mock('../../data/kv.server', () => ({
  getValue: async (key) => kv.get(key) ?? null,
  setValue: async (key, value, { expiresAt }) => void kv.set(key, { value, expires_at: expiresAt }),
  deleteValue: async (key) => void kv.delete(key),
}));

const { clientMetadata, stateStore } = await import('./oauth.server');

describe('clientMetadata', () => {
  it('publishes its own URL as the client ID in production', () => {
    expect(clientMetadata('https://community.indieco.xyz')).toMatchObject({
      client_id: 'https://community.indieco.xyz/oauth/client-metadata.json',
      redirect_uris: ['https://community.indieco.xyz/auth/bluesky/callback'],
      scope: 'atproto transition:email',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
    });
  });

  it('is a loopback client locally, redirecting to 127.0.0.1', () => {
    const { client_id, redirect_uris } = clientMetadata('http://localhost:5000');
    expect(redirect_uris).toEqual(['http://127.0.0.1:5000/auth/bluesky/callback']);
    const url = new URL(client_id);
    expect(url.origin).toBe('http://localhost');
    expect(url.searchParams.get('redirect_uri')).toBe(redirect_uris[0]);
    expect(url.searchParams.get('scope')).toBe('atproto transition:email');
  });
});

describe('stateStore', () => {
  it('keeps the DPoP key through kv, for ten minutes', async () => {
    const dpopKey = await JoseKey.generate(['ES256']);
    await stateStore.set('s1', { iss: 'https://bsky.social', dpopKey, verifier: 'v', appState: '/games' });
    const stored = kv.get('oauth-state:s1');
    expect(stored.expires_at.getTime() - Date.now()).toBeGreaterThan(9 * 60 * 1000);
    expect(stored.value).not.toContain('[object');

    const state = await stateStore.get('s1');
    expect(state).toMatchObject({ iss: 'https://bsky.social', verifier: 'v', appState: '/games' });
    expect(state.dpopKey.privateJwk).toEqual(dpopKey.privateJwk);

    await stateStore.del('s1');
    expect(await stateStore.get('s1')).toBeUndefined();
  });

  it('forgets an expired state', async () => {
    kv.set('oauth-state:old', { value: '{}', expires_at: new Date(Date.now() - 1) });
    expect(await stateStore.get('old')).toBeUndefined();
  });
});
