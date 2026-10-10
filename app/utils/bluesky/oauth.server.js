// Bluesky (AT Protocol OAuth) sign-in (#157, as found in #155): a public
// client, as we only need the identity at sign-in; our own cookie session
// takes over afterwards, so no tokens are kept.
import { JoseKey } from '@atproto/jwk-jose';
import { OAuthClient } from '@atproto/oauth-client';

import { deleteValue, getValue, setValue } from '../../data/kv.server';
import { didResolver, handleResolver } from './resolvers.server';

export const SCOPE = 'atproto transition:email';
const STATE_PREFIX = 'oauth-state:';
const STATE_TTL_MS = 10 * 60 * 1000;

// The pending sign-ins, between the redirect and the callback (which can
// reach another Worker instance): in kv, the DPoP key as a JWK.
export const stateStore = {
  async get(key) {
    const stored = await getValue(STATE_PREFIX + key);
    if (!stored || stored.expires_at < new Date()) return undefined;
    const { dpopJwk, ...state } = JSON.parse(stored.value);
    return { ...state, dpopKey: await JoseKey.fromJWK(dpopJwk) };
  },
  async set(key, { dpopKey, ...state }) {
    await setValue(
      STATE_PREFIX + key,
      JSON.stringify({ ...state, dpopJwk: dpopKey.privateJwk }),
      { expiresAt: new Date(Date.now() + STATE_TTL_MS) }
    );
  },
  async del(key) {
    await deleteValue(STATE_PREFIX + key);
  },
};

// Tokens only live for the callback request.
const memoryStore = () => {
  const map = new Map();
  return {
    get: async (key) => map.get(key),
    set: async (key, value) => void map.set(key, value),
    del: async (key) => void map.delete(key),
  };
};

/**
 * The OAuth state of a link to a signed-in person's profile (#158), rather
 * than a sign-in, whose state is the page to return to.
 */
export const LINK_STATE = 'link';

/** The callback's URL. */
export const redirectUri = (origin) => `${origin}/auth/bluesky/callback`;

/** Whether `origin` is local: then the client is a loopback client. */
const isLoopback = (origin) =>
  /^http:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(origin);

/**
 * The client metadata (published at /oauth/client-metadata.json, whose URL
 * is the client ID). Local origins use a loopback client instead, which
 * needs no published metadata; its redirect URI must use 127.0.0.1.
 */
export function clientMetadata(origin) {
  const local = isLoopback(origin);
  const callback = redirectUri(
    local ? origin.replace('localhost', '127.0.0.1') : origin
  );
  return {
    client_id: local
      ? `http://localhost?redirect_uri=${encodeURIComponent(callback)}&scope=${encodeURIComponent(SCOPE)}`
      : `${origin}/oauth/client-metadata.json`,
    client_name: 'Indie Collective Community',
    client_uri: origin,
    redirect_uris: [callback],
    scope: SCOPE,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  };
}

/** The OAuth client for the site at `origin`. */
export function createBlueskyClient(origin) {
  return new OAuthClient({
    responseMode: 'query',
    clientMetadata: clientMetadata(origin),
    handleResolver,
    didResolver,
    runtimeImplementation: {
      createKey: (algs) => JoseKey.generate(algs),
      getRandomValues: (length) =>
        crypto.getRandomValues(new Uint8Array(length)),
      digest: async (bytes, { name }) =>
        new Uint8Array(
          await crypto.subtle.digest(name.replace('sha', 'SHA-'), bytes)
        ),
    },
    stateStore,
    sessionStore: memoryStore(),
  });
}

/**
 * Who signed in, from the callback's session: their DID and handle, their
 * email if it's confirmed (the `transition:email` scope), and their display
 * name and avatar from the public AppView (no extra scope needed). Signs
 * the OAuth session out: we keep our own.
 */
export async function identityOf(session) {
  try {
    const accountResponse = await session.fetchHandler(
      '/xrpc/com.atproto.server.getSession'
    );
    const account = accountResponse.ok ? await accountResponse.json() : {};
    const profileResponse = await fetch(
      `${process.env.BLUESKY_API || 'https://public.api.bsky.app'}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(session.did)}`
    ).catch(() => null);
    const profile = profileResponse?.ok ? await profileResponse.json() : {};
    return {
      did: session.did,
      handle: account.handle ?? profile.handle ?? null,
      email: account.emailConfirmed ? account.email : null,
      displayName: profile.displayName || null,
      avatar: profile.avatar ?? null,
    };
  } finally {
    await session.signOut().catch(() => {});
  }
}
