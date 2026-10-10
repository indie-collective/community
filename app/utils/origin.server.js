/**
 * The site's public origin, e.g. "https://community.indieco.xyz".
 *
 * BASE_URL wins when set, so links and meta tags stay right behind a proxy
 * that rewrites the host; otherwise it's the origin the request came in on.
 */
export default function getOrigin(request) {
  return toOrigin(process.env.BASE_URL) || new URL(request.url).origin;
}

/**
 * A host or URL from configuration as an origin: https:// when it has no
 * scheme, no trailing slash ("cdn.indieco.xyz/" → "https://cdn.indieco.xyz").
 * Empty for nothing.
 */
export function toOrigin(value) {
  const trimmed = value?.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
