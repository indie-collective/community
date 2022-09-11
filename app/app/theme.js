import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from '@chakra-ui/react';

const theme = extendTheme(
  {
    styles: {
      global: {
        body: {
          bg: '#F7FAFC',
        },
      },
    },
    colors: {
      discord: {
        50: '#e7e9fd',
        100: '#b2cdfa',
        200: '#929bf7',
        300: '#6873f3',
        400: '#3d4cf0',
        500: '#1225ed',
        600: '#0f1dbd',
        700: '#0b168e',
        800: '#070f5f',
        900: '#04072f',
      },
      github: {
        50: '#F2F2F2',
        100: '#DBDBDB',
        200: '#C4C4C4',
        300: '#ADADAD',
        400: '#969696',
        500: '#808080',
        600: '#666666',
        700: '#4D4D4D',
        800: '#333333',
        900: '#1A1A1A',
      },
    },
  },
  withDefaultColorScheme({ colorScheme: 'teal' }),
  withDefaultVariant({
    variant: 'filled',
    components: ['Input', 'Textarea'],
  })
);

export default theme;
