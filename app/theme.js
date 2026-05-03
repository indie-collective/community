import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
// import { mode } from '@chakra-ui/theme-tools';
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

const config = defineConfig({
  theme: {
    keyframes: {
      highlight: {
        '0%, 100%': {
          transform: 'scale(1)',
        },
        '50%': {
          transform: 'scale(0.9)',
          boxShadow:
            '0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2)',
        },
      },
    },
    tokens: {
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
      animations: {
        highlight: { value: `highlight 500ms ease-in-out 500ms` },
      },
    },
  },
  // styles: {
  //   global: (props) => ({
  //     body: {
  //       color: mode('gray.800', 'whiteAlpha.900')(props),
  //       bg: mode('#F7FAFC', 'gray.800')(props),
  //     },
  //   }),
  // },

  // withDefaultColorScheme({ colorScheme: 'green' }),
  // withDefaultVariant({
  //   variant: 'filled',
  //   components: ['Input', 'Textarea'],
  // })
});

export const system = createSystem(defaultConfig, config);

export { system as default };
