// The #155 authorize leg inside Cloudflare's runtime (workerd):
//   npx wrangler dev, then GET /?handle=<handle>
import { createClient } from './client.mjs';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const handle = url.searchParams.get('handle') ?? 'bsky.app';
    try {
      const client = createClient({ redirectUri: 'http://127.0.0.1:8788/callback' });
      const target = await client.authorize(handle, { state: '/' });
      return Response.json({ authorizationServer: target.host, pushedAuthorizationRequest: target.searchParams.has('request_uri') });
    } catch (error) {
      const chain = [];
      for (let e = error; e; e = e.cause) chain.push(String(e));
      return Response.json({ chain }, { status: 500 });
    }
  },
};
