import { Box } from '@chakra-ui/react';

const TONES = {
  sun: 'sun',
  coral: 'coral',
  lilac: 'lilac',
  brand: 'brand',
};

// The big round one on the homepage's cover story, slapped on at an angle;
// `land` plays its landing once.
const ROUND = {
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  fontFamily: 'heading',
  fontWeight: 'bold',
  lineHeight: '1.05',
  letterSpacing: '-0.01em',
  fontSize: 'md',
  px: 0,
  py: 0,
  w: { base: '84px', md: '100px' },
  h: { base: '84px', md: '100px' },
  borderRadius: 'full',
  shadow: 'lift',
  whiteSpace: 'normal',
};

/**
 * A short status on a card: "Canceled", "Online", "You're going". Status
 * only, never decoration, so each says something true about what it's on.
 * `round` makes the cover story's sticker.
 */
const Sticker = ({
  tone = 'sun',
  round = false,
  rotate = -14,
  land = false,
  children,
  ...rest
}) => (
  <Box
    as="span"
    display="inline-block"
    bg={TONES[tone] ?? tone}
    color="onPop"
    fontSize="xs"
    fontWeight="medium"
    lineHeight="1.4"
    px={2}
    py={0.5}
    borderRadius="label"
    whiteSpace="nowrap"
    {...(round && {
      ...ROUND,
      transform: `rotate(${rotate}deg)`,
      css: { '--sticker-rotate': `${rotate}deg` },
      animation: land
        ? 'sticker-land 500ms cubic-bezier(0.3, 1.4, 0.5, 1) 500ms both'
        : undefined,
    })}
    {...rest}
  >
    {children}
  </Box>
);

export default Sticker;
