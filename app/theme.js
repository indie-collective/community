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
    // #350: no motion for those who asked for less (transitions, hovers,
    // animations, page cross-fades).
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
      '::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)': {
        animation: 'none !important',
      },
    },
    // One page background (the canvas), with panels (surface) on it.
    body: {
      color: 'ink',
      bg: 'canvas',
    },

    // Page transitions (design pass): the page fades out quickly and the
    // next one fades in as it rises; the header and footer stay put; a
    // card's image moves into the page it opens (record-image, CardLink).
    '::view-transition-old(root)': {
      animation: '120ms ease-out both vt-fade-out',
    },
    '::view-transition-new(root)': {
      animation: '260ms cubic-bezier(0.2, 0, 0, 1) 60ms both vt-fade-in',
    },
    '::view-transition-group(record-image)': {
      animationDuration: '340ms',
      animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
    },
    '::view-transition-old(record-image), ::view-transition-new(record-image)':
      {
        height: '100%',
        objectFit: 'cover',
        overflow: 'clip',
      },

    // People who ask for less motion get none: no page transitions, and
    // animations and transitions end at once.
    '@media (prefers-reduced-motion: reduce)': {
      '::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)':
        {
          animation: 'none !important',
        },
      '*, *::before, *::after': {
        animationDuration: '0.01ms !important',
        animationDelay: '0ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
    },
  },
  theme: {
    keyframes: {
      'vt-fade-out': { to: { opacity: 0 } },
      'vt-fade-in': { from: { opacity: 0, transform: 'translateY(8px)' } },
      // Lists appearing (Reveal).
      rise: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'none' },
      },
      // The homepage cover (magazine pass): the cover card settles into its
      // tilt, and its sticker lands on it.
      settle: {
        from: { transform: 'rotate(9deg) translateY(16px)' },
      },
      'sticker-land': {
        '0%': { transform: 'scale(1.5) rotate(-30deg)', opacity: 0 },
        '70%': { transform: 'scale(0.94) rotate(var(--sticker-rotate))' },
        '100%': { transform: 'rotate(var(--sticker-rotate))' },
      },
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
        // The magazine pass: paper and ink with a green bias from the logo,
        // the logo's two greens, and three pops for stickers and filters.
        // The page background (paper), and the panels and cards on it.
        canvas: {
          value: { base: '#f3f6f2', _dark: '#0d1715' },
        },
        surface: {
          value: { base: '{colors.white}', _dark: '#15221f' },
        },
        // Text, rules around pressable things and the hard shadows.
        ink: {
          value: { base: '#10201d', _dark: '#e8f1ee' },
        },
        // Secondary text: dates, places, counts, hints. Readable on both
        // (WCAG AA on canvas and surface).
        muted: {
          value: { base: '#4f625d', _dark: '#9db2ac' },
        },
        // Hairlines: dashed ticket perforations, list separators.
        rule: {
          value: { base: '#cdd8d3', _dark: '#2a3c38' },
        },
        // The logo's C and I.
        brand: {
          value: { base: '#149c88', _dark: '#2cc4ac' },
        },
        brandDeep: {
          value: { base: '#054f45', _dark: '#8fe3d4' },
        },
        // Pops, only for stickers, highlights and selected filters: they
        // carry status, never decoration. Text on them is always onPop.
        sun: { value: '#ffd23f' },
        coral: { value: { base: '#ff6b5b', _dark: '#ff8475' } },
        lilac: { value: { base: '#b9a7ff', _dark: '#c4b5ff' } },
        onPop: { value: '#10201d' },
        // Solid green (buttons, badges) a shade darker, so its white text
        // reads (#350: green.600 was 3.3:1, under WCAG AA's 4.5:1; green.700
        // is 5:1).
        green: {
          solid: { value: '{colors.green.700}' },
        },
      },
      shadows: {
        // A hard offset shadow means "you can press this" (magazine pass).
        pop: { value: '4px 4px 0 var(--chakra-colors-ink)' },
        popHover: { value: '5px 5px 0 var(--chakra-colors-brand)' },
        // Cards lifted off the paper: covers, tickets.
        lift: {
          value: {
            base: '0 1px 0 rgba(16,32,29,.08), 0 10px 24px -12px rgba(16,32,29,.35)',
            _dark: '0 1px 0 rgba(0,0,0,.4), 0 12px 28px -14px rgba(0,0,0,.8)',
          },
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
      // The magazine's pressable button: ink, outlined, with a hard shadow
      // it rises onto under the pointer.
      button: {
        variants: {
          variant: {
            pop: {
              bg: 'ink',
              color: 'canvas',
              borderWidth: '2px',
              borderColor: 'ink',
              fontWeight: 'semibold',
              transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
              _hover: {
                transform: 'translate(-2px, -2px)',
                shadow: 'popHover',
              },
              _active: { transform: 'none', shadow: 'none' },
            },
            popOutline: {
              bg: 'transparent',
              color: 'ink',
              borderWidth: '2px',
              borderColor: 'ink',
              fontWeight: 'semibold',
              transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
              _hover: { transform: 'translate(-2px, -2px)', shadow: 'pop' },
              _active: { transform: 'none', shadow: 'none' },
            },
          },
        },
      },
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
            lg: { fontSize: 'xl', lineHeight: '1.3' },
            xl: { fontSize: { base: 'xl', md: '2xl' }, lineHeight: '1.25' },
            '2xl': { fontSize: { base: '3xl', md: '4xl' }, lineHeight: '1.15' },
            '3xl': { fontSize: { base: '4xl', md: '5xl' }, lineHeight: '1.1' },
            '4xl': { fontSize: { base: '5xl', md: '6xl' }, lineHeight: '1.05' },
            // The homepage cover (magazine pass): heavy and tight.
            cover: {
              fontSize: { base: '2.6rem', sm: '3.4rem', md: '4.2rem' },
              lineHeight: '0.98',
              fontWeight: '800',
              letterSpacing: '-0.035em',
            },
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
