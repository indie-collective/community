import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Input: {
      defaultProps: {
        variant: 'filled',
      },
    },
    Textarea: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

export default theme;
