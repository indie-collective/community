import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultVariant,
} from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  shadows: Array(25).fill('none'),
});

const theme = extendTheme(
  {
    styles: {
      global: (props) => ({
        body: {
          color: mode('gray.800', 'whiteAlpha.900')(props),
          bg: mode('#F7FAFC', 'gray.800')(props),
        },
      }),
    },
    colors: {
      discord: {
        50: '#e7e9fd',
        100: '#b2cdfa',
        200: '#929bf7',
        300: '#6873f3',
        400: '#6873f3',
        500: '#6873f3',
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
  withDefaultColorScheme({ colorScheme: 'green' }),
  withDefaultVariant({
    variant: 'filled',
    components: ['Input', 'Textarea'],
  })
);

export default theme;
