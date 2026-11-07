import { Box } from '@chakra-ui/react';

const TONES = {
  sun: 'sun',
  coral: 'coral',
  lilac: 'lilac',
  brand: 'brand',
};

/**
 * A sticker slapped on a cover or a ticket (magazine pass): a short status,
 * "Cover story", "Canceled", "Studio". Stickers carry status, never
 * decoration, so each says something true about what it's on. `round` makes
 * the big round one on the homepage cover; `land` plays its landing once.
 */
const Sticker = ({
  tone = 'sun',
  rotate = -3,
  round = false,
  land = false,
  children,
  ...rest
}) => (
  <Box
    as="span"
    display={round ? 'grid' : 'inline-block'}
    placeItems="center"
    textAlign="center"
    bg={TONES[tone] ?? tone}
    color="onPop"
    fontFamily="heading"
    fontWeight="bold"
    lineHeight="1.05"
    letterSpacing={round ? '-0.01em' : 'wider'}
    textTransform={round ? 'none' : 'uppercase'}
    fontSize={round ? 'md' : '2xs'}
    px={round ? 0 : 2}
    py={round ? 0 : 1}
    w={round ? { base: '84px', md: '100px' } : undefined}
    h={round ? { base: '84px', md: '100px' } : undefined}
    borderRadius={round ? 'full' : 'md'}
    shadow="lift"
    whiteSpace={round ? 'normal' : 'nowrap'}
    transform={`rotate(${rotate}deg)`}
    css={{ '--sticker-rotate': `${rotate}deg` }}
    animation={
      land
        ? 'sticker-land 500ms cubic-bezier(0.3, 1.4, 0.5, 1) 500ms both'
        : undefined
    }
    {...rest}
  >
    {children}
  </Box>
);

export default Sticker;
