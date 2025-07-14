import { createSystem, defaultConfig } from '@chakra-ui/react';
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

const system = createSystem(defaultConfig, {
  theme: {
    semanticTokens: {
      colors: {
        bodyBg: {
          default: { value: '#F7FAFC' },
          _dark: { value: '{colors.gray.800}' },
        },
        bodyText: {
          default: { value: '{colors.gray.800}' },
          _dark: { value: '{colors.whiteAlpha.900}' },
        },
      },
    },
    tokens: {
      colors: {
        discord: {
          50: { value: '#e7e9fd' },
          100: { value: '#b2cdfa' },
          200: { value: '#929bf7' },
          300: { value: '#6873f3' },
          400: { value: '#3d4cf0' },
          500: { value: '#1225ed' },
          600: { value: '#0f1dbd' },
          700: { value: '#0b168e' },
          800: { value: '#070f5f' },
          900: { value: '#04072f' },
        },
        github: {
          50: { value: '#F2F2F2' },
          100: { value: '#DBDBDB' },
          200: { value: '#C4C4C4' },
          300: { value: '#ADADAD' },
          400: { value: '#969696' },
          500: { value: '#808080' },
          600: { value: '#666666' },
          700: { value: '#4D4D4D' },
          800: { value: '#333333' },
          900: { value: '#1A1A1A' },
        },
      },
    },
    styles: {
      global: {
        body: {
          bg: 'bodyBg',
          color: 'bodyText',
        },
      },
    },
  },
  // Default props for components to replace withDefaultColorScheme and withDefaultVariant
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'teal',
      },
    },
    Input: {
      defaultProps: {
        variant: 'filled',
        colorScheme: 'teal',
      },
    },
    Textarea: {
      defaultProps: {
        variant: 'filled',
        colorScheme: 'teal',
      },
    },
  },
});

export default system;