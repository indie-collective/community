import { env } from 'cloudflare:workers';

// Images straight from R2, where there's no CDN_HOST to serve them
// (development and the end-to-end tests; see utils/imageLinks).
export async function loader({ params }) {
  const object = await env.IMAGES.get(params['*']);
  if (!object) throw new Response('Not Found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  return new Response(object.body, { headers });
}
