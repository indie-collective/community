/**
 * A web address typed in a form, as a link: https:// added when there's no
 * scheme ("stunfest.fr"), and only http(s) kept, so nothing like
 * `javascript:` reaches an href. Null when empty or not a web address.
 */
export function webUrl(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}
