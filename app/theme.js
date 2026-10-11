import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  // v2 `styles.global` via `mode()` → v3 `globalCss` with the `_dark` selector.
  // The `html` colorPalette replaces v2 `withDefaultColorScheme({ colorScheme:
  // 'green' })`: in v3 `colorPalette` cascades to every descendant, so setting
  // it once on the root makes green the app-wide default (overridable per component).
  globalCss: {
    html: {
      colorPalette: 'green',
    },
    // One page background (the canvas), with panels (surface) on it.
    body: {
      color: 'gray.800',
      bg: 'canvas',
      _dark: {
        color: 'whiteAlpha.900',
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
    // The design system (design pass): Poppins for titles, Inter for text,
    // loaded in root.jsx.
    semanticTokens: {
      colors: {
        // The page background, and the panels and cards on it.
        canvas: {
          value: { base: '{colors.gray.100}', _dark: '{colors.gray.950}' },
        },
        surface: {
          value: { base: '{colors.white}', _dark: '{colors.gray.900}' },
        },
        // Secondary text: dates, places, counts, hints. Readable on both
        // (WCAG AA on canvas and surface).
        muted: {
          value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
        },
      },
    },
    tokens: {
      fonts: {
        heading: { value: "'Poppins', ui-sans-serif, system-ui, sans-serif" },
        body: {
          value:
            "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        },
      },
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
    // recipe deep-merges into the base recipe, overriding only what's listed.
    // `subtle` fills with bg.muted, the same gray as the page background, so
    // fields were invisible; fill them with a colour that contrasts instead.
    recipes: {
      // v2's Link inherited the text colour; v3's plain variant uses
      // colorPalette.fg, which the app-wide green palette made green.
      link: {
        variants: { variant: { plain: { color: 'inherit' } } },
      },
      // The type scale (design pass), in Poppins. Each level has one use:
      // 3xl the homepage's introduction, 2xl a page's title (h1), xl a
      // section of a page (h2), lg a block inside a section, md a card's
      // title, sm and xs small labels.
      heading: {
        base: { fontWeight: 'semibold', letterSpacing: '-0.01em' },
        variants: {
          size: {
            xs: { fontSize: 'sm', lineHeight: '1.3' },
            sm: { fontSize: 'md', lineHeight: '1.3' },
            md: { fontSize: 'lg', lineHeight: '1.3' },
            lg: { fontSize: { base: 'xl', md: '2xl' }, lineHeight: '1.25' },
            xl: { fontSize: { base: '2xl', md: '3xl' }, lineHeight: '1.2' },
            '2xl': { fontSize: { base: '3xl', md: '4xl' }, lineHeight: '1.15' },
            '3xl': { fontSize: { base: '4xl', md: '5xl' }, lineHeight: '1.1' },
            '4xl': { fontSize: { base: '5xl', md: '6xl' }, lineHeight: '1.05' },
          },
        },
      },
      input: {
        defaultVariants: { variant: 'subtle' },
        variants: {
          variant: { subtle: { bg: { base: 'white', _dark: 'gray.800' } } },
        },
      },
      textarea: {
        defaultVariants: { variant: 'subtle' },
        variants: {
          variant: { subtle: { bg: { base: 'white', _dark: 'gray.800' } } },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

export { system as default };
