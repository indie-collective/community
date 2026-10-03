// The OAuth client for #155, shared by the Node server and the Worker.
// Public client: we only need the identity at sign-in (DID, handle, email);
// our own cookie session takes over after that, so no long-lived tokens.
import { OAuthClient } from '@atproto/oauth-client';
import { JoseKey } from '@atproto/jwk-jose';

import { edgeDidResolver, edgeHandleResolver } from './edge-resolvers.mjs';

export const SCOPE = 'atproto transition:email';

const memoryStore = (map = new Map()) => ({
  get: async (key) => map.get(key),
  set: async (key, value) => void map.set(key, value),
  del: async (key) => void map.delete(key),
});

/**
 * `redirectUri` on 127.0.0.1 makes a loopback client (local development, no
 * published metadata); in production `clientId` is the URL of the published
 * client metadata document. `stateStore` must be shared between the redirect
 * and the callback (a database table in the app; a Map here).
 */
export function createClient({ redirectUri, clientId, stateStore = memoryStore() }) {
  const loopback = !clientId;
  return new OAuthClient({
    responseMode: 'query',
    clientMetadata: {
      client_id: loopback
        ? `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPE)}`
        : clientId,
      redirect_uris: [redirectUri],
      scope: SCOPE,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      application_type: 'web',
      dpop_bound_access_tokens: true,
    },
    handleResolver: edgeHandleResolver,
    didResolver: edgeDidResolver,
    runtimeImplementation: {
      // jose: WebCrypto on Workers, KeyObjects on Node.
      createKey: (algs) => JoseKey.generate(algs),
      getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
      digest: async (bytes, { name }) => new Uint8Array(await crypto.subtle.digest(name.replace('sha', 'SHA-'), bytes)),
    },
    stateStore,
    // Tokens only live for the callback request.
    sessionStore: memoryStore(),
  });
}
