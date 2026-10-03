/**
 * The site's public origin, e.g. "https://community.indieco.xyz".
 *
 * BASE_URL wins when set, so links and meta tags stay right behind a proxy
 * that rewrites the host; otherwise it's the origin the request came in on.
 */
export default function getOrigin(request) {
  const base = process.env.BASE_URL?.trim().replace(/\/+$/, '');
  return base || new URL(request.url).origin;
}
