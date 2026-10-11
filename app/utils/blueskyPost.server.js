// Announcing new games, events and organisations on Bluesky, from the
// Indie Collective account (#160), next to the Discord notice. It signs in
// with an app password (BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD), finds
// the account's server from its handle, and posts a line with a link card.
// Never throws: a failed announcement is only logged.
import { didResolver, handleResolver } from './bluesky/resolvers.server';

const MAX_GRAPHEMES = 300;

// The account's server (PDS), from its DID document; BLUESKY_SERVICE
// overrides it (the end-to-end tests' stand-in).
async function serviceFor(identifier) {
  if (process.env.BLUESKY_SERVICE) return process.env.BLUESKY_SERVICE;
  const did = identifier.startsWith('did:')
    ? identifier
    : await handleResolver.resolve(identifier);
  if (!did) throw new Error(`Can't resolve ${identifier}`);
  const document = await didResolver.resolve(did);
  const pds = document.service?.find((service) => service.id.endsWith('#atproto_pds'));
  if (!pds) throw new Error(`No PDS for ${did}`);
  return pds.serviceEndpoint.replace(/\/+$/, '');
}

async function xrpc(service, method, body, token) {
  const response = await fetch(`${service}/xrpc/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// Cut to Bluesky's length, by graphemes (what it counts), with an ellipsis.
function fit(text, max) {
  const graphemes = [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
  return graphemes.length <= max ? text : graphemes.slice(0, max - 1).join('') + '…';
}

/**
 * The post's record: `text`, then the link on its own line, made clickable
 * (a link facet, with UTF-8 byte offsets), and a link card.
 */
export function postRecord({ text, url, title, description }, now = new Date()) {
  const line = fit(text, MAX_GRAPHEMES - [...new Intl.Segmenter().segment(url)].length - 2);
  const full = `${line}\n\n${url}`;
  const bytes = new TextEncoder();
  const byteStart = bytes.encode(`${line}\n\n`).length;
  return {
    $type: 'app.bsky.feed.post',
    text: full,
    createdAt: now.toISOString(),
    langs: ['en'],
    facets: [
      {
        index: { byteStart, byteEnd: byteStart + bytes.encode(url).length },
        features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
      },
    ],
    embed: {
      $type: 'app.bsky.embed.external',
      external: { uri: url, title: fit(title, 300), description: fit(description ?? '', 1000) },
    },
  };
}

/**
 * Posts an announcement from the IC account: `{ text, url, title,
 * description }`. Skipped (with a warning) when the account isn't
 * configured.
 */
export async function announceOnBluesky(post) {
  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!identifier || !password) {
    console.warn('BLUESKY_IDENTIFIER and BLUESKY_APP_PASSWORD are not configured');
    return;
  }
  try {
    const service = await serviceFor(identifier);
    const session = await xrpc(service, 'com.atproto.server.createSession', {
      identifier,
      password,
    });
    await xrpc(
      service,
      'com.atproto.repo.createRecord',
      { repo: session.did, collection: 'app.bsky.feed.post', record: postRecord(post) },
      session.accessJwt
    );
  } catch (error) {
    console.error('Failed to announce on Bluesky', error);
  }
}
