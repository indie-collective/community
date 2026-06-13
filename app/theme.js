import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
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
  // v2 `styles.global` via `mode()` → v3 `globalCss` with the `_dark` selector.
  // The `html` colorPalette replaces v2 `withDefaultColorScheme({ colorScheme:
  // 'green' })`: in v3 `colorPalette` cascades to every descendant, so setting
  // it once on the root makes green the app-wide default (overridable per component).
  globalCss: {
    html: {
      colorPalette: 'green',
    },
    body: {
      color: 'gray.800',
      bg: '#F7FAFC',
      _dark: {
        color: 'whiteAlpha.900',
        bg: 'gray.800',
      },
    },
  },
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
      // v3 requires token values wrapped in `{ value }` objects, not raw hex.
      colors: {
        discord: {
          50: { value: '#e7e9fd' },
          100: { value: '#b2cdfa' },
          200: { value: '#929bf7' },
          300: { value: '#6873f3' },
          400: { value: '#6873f3' },
          500: { value: '#6873f3' },
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
      animations: {
        highlight: { value: `highlight 500ms ease-in-out 500ms` },
      },
    },
    // v2 `withDefaultVariant({ variant: 'filled', components: ['Input',
    // 'Textarea'] })`. The v2 `filled` variant maps to v3 `subtle`. The partial
    // recipe deep-merges into the base recipe, overriding only the default.
    recipes: {
      input: { defaultVariants: { variant: 'subtle' } },
      textarea: { defaultVariants: { variant: 'subtle' } },
    },
  },
});

export const system = createSystem(defaultConfig, config);

export { system as default };
