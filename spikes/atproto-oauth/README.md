# AT Protocol OAuth spike (#155)

How to sign people in with Bluesky (AT Protocol OAuth) in this app, on today's
Node server **and** on Cloudflare Workers (#152), proved with a small spike.
It's not wired into the app; #157 builds the real thing from it.

## Recommendation

| Question | Answer |
|---|---|
| Library | **`@atproto/oauth-client`** (the generic, runtime-agnostic client) with `JoseKey` keys and two small edge-safe resolvers (`edge-resolvers.mjs`). **Not** `@atproto/oauth-client-node`: it depends on `undici`, `node:net` and `node:dns`, which don't belong on Workers. |
| Workers | Works, with the custom resolvers. The stock DID and handle resolvers call `fetch(…, { redirect: 'error' })`, which `workerd` refuses even to construct ("'error' won't be implemented… use 'manual'"); the custom ones use `'manual'` and treat a redirect as a failure. A custom `fetch` option can't fix it, because the library builds the `Request` before calling it. |
| Keys | `JoseKey.generate` (jose uses WebCrypto on Workers, `KeyObject`s on Node). `WebcryptoKey` fails on Node 22 ("Invalid CryptoKeyPair"). |
| Public or confidential client | **Public** (`token_endpoint_auth_method: none`). We only need the identity at sign-in; our own cookie session (`toSessionUser`, #216) takes over afterwards. So there are no private keys or JWKS to host, no long-lived tokens to store, and no refresh lock (`requestLock`) to provide across Worker instances. Confidential clients only buy longer token lifetimes, which we'd never use. Posting as IC (#160) is a separate account with an app password. |
| Scopes | `atproto transition:email`. The email comes from `com.atproto.server.getSession`; keep it only when `emailConfirmed` is true. Read the display name and avatar from the **public** AppView (`public.api.bsky.app`, no tokens): an authenticated `getProfile` needs an extra `rpc:app.bsky.actor.getProfile?aud=…` permission scope, which sign-in doesn't need. |
| remix-auth | **Bypass it** for Bluesky: two plain routes, `POST /auth/bluesky` (authorize → redirect) and `GET /auth/bluesky/callback` (callback → find or create the person by DID → `toSessionUser` → session cookie → `_prev` redirect, #232). A remix-auth `Strategy` would only wrap the same two calls. Discord stays on remix-auth until #159. |
| Local development | Loopback client: `client_id` is `http://localhost?redirect_uri=…&scope=…`, and the redirect URI must use **`127.0.0.1`**, not `localhost`. So open the dev server as `http://127.0.0.1:3013` when testing sign-in. No published metadata is needed. |
| Production | Publish the client metadata at `https://community.indieco.xyz/oauth/client-metadata.json`, with that URL as `client_id` and the same fields as `client.mjs`. |
| Stores | **State store**: shared between the redirect and the callback (and across Worker instances), so a database table, portable to SQLite: `oauth_state { key String @id, value String /* JSON */, created_at DateTime @default(now()) }`. Delete rows older than ~10 minutes. **Session store**: only lives for the callback request (an in-memory `Map`); call `session.signOut()` after reading the identity. |
| Identity to keep | `did` (the stable key, `@unique` on `person`), handle (display only, refreshed on each sign-in), confirmed email, display name, avatar URL. |

## What was verified (2026-10-03)

| Step | Node 22 | workerd (`wrangler dev`) |
|---|---|---|
| Handle → DID by DNS TXT (`bsky.app`, `pfrazee.com`) | ✓ | ✓ |
| Handle → DID by HTTPS well-known (`jay.bsky.team`) | ✓ | ✓ |
| DID → PDS → authorization server discovery | ✓ | ✓ |
| Pushed authorization request with a DPoP key, loopback client | ✓ | ✓ |
| **Callback: token exchange, `getSession`, profile** | **not yet** (needs a real sign-in) | not yet |

## Try it

```bash
cd spikes/atproto-oauth && npm install
npm run node      # then open http://127.0.0.1:8788/login?handle=<your handle>
```

Sign in at bsky.social. The callback prints what sign-in would keep (DID, handle, confirmed email, display name, avatar) and signs the OAuth session out.

```bash
npm run worker    # then GET http://localhost:8799/?handle=<handle>
```

This runs the authorize leg inside `workerd`.
