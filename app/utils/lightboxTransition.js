import { flushSync } from 'react-dom';

// The lightbox's view transitions: opening, an image grows out of its
// thumbnail; going to the next or previous one, it slides; closing, it goes
// back into its thumbnail. `kind` (open, next, prev, close) is set on <html>
// as data-lightbox while it runs, for the styles in theme.js.
//
// The image moving is named `lightbox-image`: in the page, the thumbnail
// (`from` before, `to` after); in the lightbox, its image (Lightbox), which
// always has the name. The page's main images (record-image, data-vt-hero)
// give theirs up while it runs, so they stay in the page under the
// lightbox's backdrop instead of being drawn over it.

let current = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setName = (element, name) => {
  if (element) element.style.viewTransitionName = name;
};

export default function lightboxTransition(kind, update, { from, to } = {}) {
  if (
    typeof document === 'undefined' ||
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    update();
    return;
  }

  const root = document.documentElement;
  const heroes = [...document.querySelectorAll('[data-vt-hero]')];
  const token = {};
  current = token;
  root.dataset.lightbox = kind;
  heroes.forEach((hero) => setName(hero, 'none'));
  setName(from, 'lightbox-image');

  let target = null;
  const transition = document.startViewTransition(async () => {
    flushSync(update);
    // Two elements can't have the name at once: the thumbnail gives it to
    // the lightbox's image.
    setName(from, from?.hasAttribute('data-vt-hero') ? 'none' : '');
    target = to?.() ?? null;
    setName(target, 'lightbox-image');
    // The new image is drawn once it's ready (briefly: the page waits).
    const image = document.querySelector('[data-lightbox-image]');
    if (image && !image.complete) {
      await Promise.race([image.decode().catch(() => {}), wait(300)]);
    }
  });

  transition.finished.finally(() => {
    setName(target, '');
    heroes.forEach((hero) => setName(hero, ''));
    if (current === token) delete root.dataset.lightbox;
  });
}
