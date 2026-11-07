import { Box } from '@chakra-ui/react';

// Colour only where it means something: sun for yours, lilac for online,
// coral for canceled. Everything else (a status, a kind, a source) is
// neutral: a hairline and muted text.
const TONES = {
  sun: { bg: 'sun', color: 'onPop' },
  coral: { bg: 'coral', color: 'onPop' },
  lilac: { bg: 'lilac', color: 'onPop' },
  neutral: {
    bg: 'transparent',
    color: 'muted',
    boxShadow: 'inset 0 0 0 1px var(--chakra-colors-rule)',
  },
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
const Label = ({
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
    {...(TONES[tone] ?? TONES.neutral)}
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

export default Label;
