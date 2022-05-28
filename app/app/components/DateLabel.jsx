import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const DateLabel = ({ value, ...rest }) => {
  const bg = useColorModeValue('#f2f2f2ab', '#282828aa');

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
        {value
          ? value.toLocaleString(undefined, {
              month: 'short',
            })
          : '—'}
      </Box>
      <Text
        fontWeight="bold"
        fontSize={['2xl', '3xl', '4xl']}
        height={['35px', '45px', '60px']}
        lineHeight={1.4}
      >
        {value
          ? value.toLocaleString(undefined, {
              day: 'numeric',
            })
          : 'X'}
      </Text>
    </Box>
  );
};

export default DateLabel;
