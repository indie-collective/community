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

// IGDB's screenshot size used for share cards: 1280×720, cropped to fit.
const IGDB_SHARE_SIZE = { name: 't_screenshot_huge', width: 1280, height: 720 };

/**
 * The image to share a game with (#333): its first uploaded image, full
 * size (thumbnails are small WebP files some platforms ignore), else its
 * first IGDB screenshot, else undefined for the site's default.
 */
export function gameShareImage(game) {
  const alt = game?.name;
  const uploaded = game?.game_image?.find((gameImage) => gameImage?.image?.url)?.image;
  if (uploaded) return { url: uploaded.url, width: uploaded.width, height: uploaded.height, alt };

  const screenshot = game?.igdb_game?.screenshots?.find((shot) => shot?.url);
  if (screenshot) {
    const { name, width, height } = IGDB_SHARE_SIZE;
    return { url: screenshot.url.replace('t_thumb', name), width, height, alt };
  }
  return undefined;
}

/** An uploaded image (a cover, a logo) to share, full size, or undefined. */
export const shareImage = (image, alt) =>
  image?.url ? { url: image.url, width: image.width, height: image.height, alt } : undefined;

// An image URL made absolute: protocol-relative ones (IGDB's "//images…")
// get https, paths get the origin. Null when it can't be.
const absolute = (url, origin) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return origin ? `${origin}${url}` : null;
};

// Square-ish images (logos) read better as a small card than cropped wide.
const isSquareish = ({ width, height }) => width > 0 && height > 0 && width / height < 1.3;

/**
 * Every page's meta, in one place (#196). React Router 7 doesn't merge a
 * route's meta with its parent's, so each route returns the whole set:
 * title, description, Open Graph and Twitter tags, with an absolute URL and
 * a share image (the page's own, else the site's default). `shareTitle`
 * (e.g. just the game's name) replaces `title` in the shared card.
 *
 * `image` is a URL or `{ url, width, height, alt }` (#333); a size and alt
 * text, when known, are shared too.
 */
export function pageMeta(matches, { title, shareTitle = title, description, image, path, type = 'website' }) {
  const origin = rootOrigin(matches);
  const text = summarize(description) || DEFAULT_DESCRIPTION;
  const picture = (typeof image === 'string' ? { url: image } : image?.url ? image : null) ?? {
    url: origin ? '/og-default.png' : null,
  };
  const imageUrl = absolute(picture.url, origin);
  const { width, height, alt } = imageUrl ? picture : {};
  const card = imageUrl && !isSquareish({ width, height }) ? 'summary_large_image' : 'summary';

  return [
    { title },
    { name: 'description', content: text },
    { property: 'og:title', content: shareTitle },
    { property: 'og:description', content: text },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    ...(path ? ogUrl(matches, path) : []),
    ...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
    ...(width > 0 && height > 0
      ? [
          { property: 'og:image:width', content: String(width) },
          { property: 'og:image:height', content: String(height) },
        ]
      : []),
    ...(alt ? [{ property: 'og:image:alt', content: alt }] : []),
    { name: 'twitter:card', content: card },
    { name: 'twitter:site', content: '@IndieColle' },
    { name: 'twitter:title', content: shareTitle },
    { name: 'twitter:description', content: text },
    ...(imageUrl ? [{ name: 'twitter:image', content: imageUrl }] : []),
    ...(alt ? [{ name: 'twitter:image:alt', content: alt }] : []),
  ];
}
