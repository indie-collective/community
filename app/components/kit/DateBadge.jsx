import { Box, Text } from '@chakra-ui/react';

import { formatEventDay } from '../../utils/eventTime';

/**
 * The day an event starts, as a small calendar leaf for rows (design pass),
 * in the event's own time zone (#204).
 */
const DateBadge = ({ value, timeZone, ...rest }) => {
  const day = formatEventDay(value, timeZone);
  return (
    <Box
      w="44px"
      flexShrink={0}
      textAlign="center"
      borderRadius="md"
      borderWidth="1px"
      overflow="hidden"
      bg="surface"
      aria-hidden
      {...rest}
    >
      <Text
        fontSize="2xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="wide"
        bg="kind.event"
        color="white"
        lineHeight="1.6"
      >
        {day?.month ?? '—'}
      </Text>
      <Text
        fontFamily="heading"
        fontWeight="semibold"
        fontSize="lg"
        lineHeight="1.5"
      >
        {day?.day ?? '?'}
      </Text>
    </Box>
  );
};

export default DateBadge;
