/**
 * `value` if it's a same-site path, else `fallback`: where to send someone
 * after signing in (#178) without becoming an open redirect. Same-site means
 * a single leading slash: not "//host", not "/\host" (which browsers treat
 * as "//host"), no scheme, no control characters.
 */
export function safeRedirectPath(value, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;

  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  for (const path of [value, decoded]) {
    if (path.startsWith('//') || path.startsWith('/\\')) return fallback;
    // Control characters are what this looks for.
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;
  }

  return value;
}
