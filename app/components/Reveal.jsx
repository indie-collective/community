import { Box } from '@chakra-ui/react';

/**
 * Rises into place as it appears (design pass): list items, staggered a
 * little by `index`. Items added later, by infinite scroll, rise as they
 * arrive. Plain CSS, so it runs before hydration, and not at all for people
 * who ask for less motion (theme.js).
 */
const Reveal = ({ index = 0, ...rest }) => (
  <Box
    animation="rise 360ms cubic-bezier(0.2, 0, 0, 1) both"
    animationDelay={`${(index % 12) * 25}ms`}
    {...rest}
  />
);

export default Reveal;
