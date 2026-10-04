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

export const SITE_NAME = 'Indie Collective';
export const DEFAULT_DESCRIPTION = 'Indie games, studios, associations and events, mapped by the community.';
const MAX_DESCRIPTION = 160;

const rootOrigin = (matches) => {
  const root = matches?.find((match) => match?.id === 'root');
  return (root?.data ?? root?.loaderData)?.origin;
};

/**
 * Free text (an "about", which may be Markdown) as a meta description:
 * plain text on one line, cut at a word to ~160 characters. Empty when
 * nothing readable is left, so callers can fall back (#196: "." and
 * "null." descriptions).
 */
export function summarize(text, max = MAX_DESCRIPTION) {
  const plain = String(text ?? '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!/[\p{L}\p{N}]/u.test(plain)) return '';
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,;:.–-]+$/, '')}…`;
}

/**
 * Every page's meta, in one place (#196). React Router 7 doesn't merge a
 * route's meta with its parent's, so each route returns the whole set:
 * title, description, Open Graph and Twitter tags, with an absolute URL and
 * a share image (the page's own, else the site's default). `shareTitle`
 * (e.g. just the game's name) replaces `title` in the shared card.
 */
export function pageMeta(matches, { title, shareTitle = title, description, image, path, type = 'website' }) {
  const origin = rootOrigin(matches);
  const text = summarize(description) || DEFAULT_DESCRIPTION;
  const picture = image ?? (origin ? '/og-default.png' : null);
  const imageUrl = picture && (/^https?:\/\//.test(picture) ? picture : origin ? `${origin}${picture}` : null);

  return [
    { title },
    { name: 'description', content: text },
    { property: 'og:title', content: shareTitle },
    { property: 'og:description', content: text },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    ...(path ? ogUrl(matches, path) : []),
    ...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
    { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
    { name: 'twitter:site', content: '@IndieColle' },
    { name: 'twitter:title', content: shareTitle },
    { name: 'twitter:description', content: text },
    ...(imageUrl ? [{ name: 'twitter:image', content: imageUrl }] : []),
  ];
}
