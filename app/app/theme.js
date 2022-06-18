import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from '@chakra-ui/react';

const theme = extendTheme(
  withDefaultColorScheme({ colorScheme: 'teal' }),
  withDefaultVariant({
    variant: 'filled',
    components: ['Input', 'Textarea'],
  }),
  {
    colors: {
      discord: '#5865F2',
    },
  }
);

export default theme;
