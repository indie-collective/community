import { Box } from '@chakra-ui/react';

/**
 * A card. Clickable ones (design pass) rise onto a panel under the pointer
 * and show a focus ring, the same for games, organisations and events;
 * `data-card` lets CardLink find the card's image (`data-card-image`) to
 * move it into the page it opens.
 */
function Card({ ref, isClickable, ...rest }) {
  const clickable = isClickable && {
    'data-card': '',
    cursor: 'pointer',
    transition:
      'background-color 160ms ease-out, transform 160ms ease-out, box-shadow 160ms ease-out',
    _hover: { bg: 'surface', shadow: 'sm', transform: 'translateY(-2px)' },
    _active: { transform: 'translateY(0)' },
    _focusWithin: {
      outline: '2px solid',
      outlineColor: 'colorPalette.focusRing',
      outlineOffset: '2px',
    },
  };

  return <Box ref={ref} position="relative" {...clickable} {...rest} />;
}

export default Card;
