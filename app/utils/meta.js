/**
 * The `og:url` tag for `path` (e.g. "/game/<id>"), made absolute with the
 * origin the root loader returns. React Router's `location` has no protocol
 * or host, so meta functions can't build it themselves (#195).
 *
 * Returns no tag rather than a broken one when the origin is unknown, e.g.
 * on an error page.
 */
export function ogUrl(matches, path) {
  const root = matches?.find((match) => match?.id === 'root');
  const origin = (root?.data ?? root?.loaderData)?.origin;
  return origin ? [{ property: 'og:url', content: `${origin}${path}` }] : [];
}
