import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme(
  withDefaultColorScheme({ colorScheme: 'teal' }),
  withDefaultVariant({
    variant: 'filled',
    components: ['Input', 'Textarea'],
  }),
);

export default theme;
