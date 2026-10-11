import { chakra } from '@chakra-ui/react';
import React from 'react';
import Link from './Link';

// chakra.a, not Chakra's Link: Link's recipe colours the text with the green
// palette, and style props given to the router Link underneath never applied,
// including the ::before overlay that makes the whole card clickable.
// Only the clicked card's image takes the name the opened page's main image
// has (record-image), so it moves into place: names must be unique on a
// page, and the page's own main image (data-vt-hero) gives it up.
function moveImageOnNavigation(event) {
  const image = event.currentTarget
    .closest('[data-card]')
    ?.querySelector('[data-card-image]');
  if (!image) return;
  for (const hero of document.querySelectorAll('[data-vt-hero]')) {
    hero.style.viewTransitionName = 'none';
  }
  image.style.viewTransitionName = 'record-image';
}

function CardLink({ ref, onClick, ...props }) {
  return (
    <chakra.a
      asChild
      position="static"
      lineClamp={2}
      wordBreak="break-word"
      _before={{
        content: "''",
        cursor: 'inherit',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      _focus={{
        outline: 'none',
      }}
    >
      <Link
        ref={ref}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) moveImageOnNavigation(event);
        }}
        {...props}
      />
    </chakra.a>
  );
}

export default CardLink;
