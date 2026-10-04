import { Box, Text } from '@chakra-ui/react';

import { useColorModeValue } from "./ui/color-mode";
import { formatEventDay } from '../utils/eventTime';

// The day an event starts, in its own time zone (#204).
const DateLabel = ({ value, timeZone, ...rest }) => {
  const bg = useColorModeValue('#f2f2f2ab', '#282828aa');
  const day = formatEventDay(value, timeZone);

  return (
    <Box
      width={['50px', '65px', '80px']}
      textAlign="center"
      borderRadius={[5, 8, 10]}
      background={bg}
      {...rest}
    >
      <Box
        fontSize={['xs', 'sm', 'md']}
        fontWeight="bold"
        roundedTop={[5, 8, 10]}
        background="#ff0000aa"
        color="white"
      >
        {day ? day.month : '—'}
      </Box>
      <Text
        fontWeight="bold"
        fontSize={['2xl', '3xl', '4xl']}
        height={['35px', '45px', '60px']}
        lineHeight={1.4}
      >
        {day ? day.day : 'X'}
      </Text>
    </Box>
  );
};

export default DateLabel;
