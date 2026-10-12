import { Box } from '@chakra-ui/react';

export const KIND_LABELS = {
  game: 'Game',
  studio: 'Studio',
  association: 'Association',
  event: 'Event',
};

/** A small dot in a kind's colour (theme `kind.*`): what a record is. */
const KindDot = ({ kind, ...rest }) => (
  <Box
    as="span"
    display="inline-block"
    boxSize="8px"
    flexShrink={0}
    borderRadius="full"
    bg={`kind.${kind}`}
    aria-hidden
    {...rest}
  />
);

export default KindDot;
