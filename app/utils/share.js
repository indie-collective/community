// Where a page can be shared (#327): each network's own share address, as a
// plain link, so no third-party script loads on the page.

const q = encodeURIComponent;

/** Share links for `url` with `text`; Mastodon needs the person's server. */
export const shareLinks = ({ url, text }) => ({
  bluesky: `https://bsky.app/intent/compose?text=${q(`${text} ${url}`)}`,
  mastodon: (instance) => `https://${instance}/share?text=${q(`${text} ${url}`)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${q(url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${q(url)}`,
  x: `https://x.com/intent/post?text=${q(text)}&url=${q(url)}`,
});
