// Local end-to-end check of the #155 flow on Node:
//   node server.mjs, then open http://127.0.0.1:8788/login?handle=<your handle>
import { createServer } from 'node:http';
import { Agent } from '@atproto/api';

import { createClient } from './client.mjs';

const PORT = 8788;
const client = createClient({ redirectUri: `http://127.0.0.1:${PORT}/callback` });

createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  try {
    if (url.pathname === '/login') {
      const target = await client.authorize(url.searchParams.get('handle') ?? 'bsky.social', { state: '/' });
      res.writeHead(302, { location: target.href }).end();
    } else if (url.pathname === '/callback') {
      const { session, state } = await client.callback(url.searchParams);
      const agent = new Agent(session);
      const { data: account } = await agent.com.atproto.server.getSession();
      const { data: profile } = await agent.getProfile({ actor: session.did });
      // What sign-in would keep: the DID as the identity, the rest for display.
      const identity = {
        did: session.did,
        handle: account.handle,
        email: account.emailConfirmed ? account.email : null,
        displayName: profile.displayName ?? null,
        avatar: profile.avatar ?? null,
        returnTo: state,
      };
      await session.signOut(); // we keep our own session, not their tokens
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(identity, null, 2));
    } else {
      res.writeHead(404).end();
    }
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain' }).end(String(error));
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Open http://127.0.0.1:${PORT}/login?handle=<your handle>`));
