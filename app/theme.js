import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

export const config = defineConfig({
  // v2 `styles.global` via `mode()` → v3 `globalCss` with the `_dark` selector.
  // `colorPalette` cascades to every descendant: set once on the root, the
  // site's own green (`primary`, below) is every Chakra component's colour.
  globalCss: {
    html: {
      colorPalette: 'primary',
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

    // #350: people who ask for less motion get none: no page transitions,
    // and animations and transitions end at once.
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
      // A badge just earned (#377): it pops in, overshoots and settles.
      'badge-pop': {
        '0%': { opacity: 0, transform: 'scale(0.4) rotate(-20deg)' },
        '60%': { opacity: 1, transform: 'scale(1.15) rotate(6deg)' },
        '100%': { opacity: 1, transform: 'scale(1) rotate(0)' },
      },
      // Lists appearing (Reveal).
      rise: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'none' },
      },
      // The homepage's cover story: the card settles into its tilt, and its
      // sticker lands on it.
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
    // The design system (design pass). Every token the site defines says
    // what it is for in its `description`; Storybook's Theme pages
    // (app/stories/theme) show them, read from here.
    semanticTokens: {
      colors: {
        // Paper and ink with a green bias from the logo, the logo's two greens,
        // and three colours that only mark state.
        canvas: {
          description: 'The page background.',
          value: { base: '#f3f6f2', _dark: '#0d1715' },
        },
        surface: {
          description: 'Panels and cards on the page.',
          value: { base: '{colors.white}', _dark: '#15221f' },
        },
        ink: {
          description: 'Text, and the rules around pressable things.',
          value: { base: '#10201d', _dark: '#e8f1ee' },
        },
        muted: {
          description:
            'Secondary text: dates, places, counts, hints. WCAG AA on canvas and surface.',
          value: { base: '#4f625d', _dark: '#9db2ac' },
        },
        rule: {
          description: 'Hairlines: dashed ticket perforations, list separators.',
          value: { base: '#cdd8d3', _dark: '#2a3c38' },
        },
        brand: {
          description:
            "The logo's green: borders on what's current or active, focus rings, studios on the atlas.",
          value: { base: '#149c88', _dark: '#2cc4ac' },
        },
        brandDeep: {
          description: "The logo's deep green. Green text on pale green.",
          value: { base: '#054f45', _dark: '#8fe3d4' },
        },
        // State only. Text on them is always onPop.
        sun: {
          description: "State: what's selected or yours.",
          value: '#ffd23f',
        },
        coral: {
          description: 'State: today, and canceled.',
          value: { base: '#ff6b5b', _dark: '#ff8475' },
        },
        lilac: {
          description: 'State: online. Also associations on the atlas.',
          value: { base: '#b9a7ff', _dark: '#c4b5ff' },
        },
        onPop: {
          description: 'Text on sun, coral and lilac, in both modes.',
          value: '#10201d',
        },
        // The site's green as a Chakra palette, the root's colorPalette: the
        // primary button, checkboxes, switches, focus rings.
        primary: {
          solid: {
            description:
              "The primary button's fill. A step darker than brand, so white on it is 5:1.",
            value: { base: '#0f7d6d', _dark: '#2cc4ac' },
          },
          contrast: {
            description: 'Text on primary.solid.',
            value: { base: '{colors.white}', _dark: '#0d1715' },
          },
          fg: {
            description: "Green text, on the palette's pale fills.",
            value: '{colors.brandDeep}',
          },
          muted: {
            description: 'Secondary buttons.',
            value: { base: '#cfe8e2', _dark: '#16423b' },
          },
          subtle: {
            description: 'The palest green fill.',
            value: { base: '#e3f2ee', _dark: '#102e29' },
          },
          emphasized: {
            description: 'Secondary buttons under the pointer.',
            value: { base: '#b5dcd3', _dark: '#1d5a50' },
          },
          focusRing: {
            description: 'Focus rings.',
            value: '{colors.brand}',
          },
        },
        // The countries table's continents: soft paper tints, each named on
        // its tiles too.
        continent: {
          EU: { description: 'Europe.', value: { base: '#dfe8f3', _dark: '#1c2a3a' } },
          NA: { description: 'North America.', value: { base: '#f6e3d3', _dark: '#3a2a1e' } },
          SA: { description: 'South America.', value: { base: '#dcefe4', _dark: '#1b3328' } },
          AS: { description: 'Asia.', value: { base: '#f4dcdc', _dark: '#3a2021' } },
          OC: { description: 'Oceania.', value: { base: '#d9eef0', _dark: '#183538' } },
          AF: { description: 'Africa.', value: { base: '#f5ecd0', _dark: '#37301a' } },
          AN: {
            description: 'Antarctica, and any unknown continent.',
            value: { base: '#e7e9e8', _dark: '#262b2a' },
          },
        },
      },
      // Three shadows, nothing else.
      // `raised` and `raisedHover` are Chakra's `xs` and `sm`, written out:
      // pointing at those (`{shadows.xs}`) keeps only their dark value, so
      // light mode got a 64% black shadow.
      shadows: {
        raised: {
          description: 'What rests on the page: cards, tickets, the filter bar, panels.',
          value: {
            base: '0px 1px 2px {colors.gray.900/10}, 0px 0px 1px {colors.gray.900/20}',
            _dark: '0px 1px 1px {black/64}, 0px 0px 1px inset {colors.gray.300/20}',
          },
        },
        raisedHover: {
          description: 'Raised things under the pointer.',
          value: {
            base: '0px 2px 4px {colors.gray.900/10}, 0px 0px 1px {colors.gray.900/30}',
            _dark: '0px 2px 4px {black/64}, 0px 0px 1px inset {colors.gray.300/30}',
          },
        },
        lift: {
          description:
            "What floats above the page: the cover story, stickers, pickers' lists, drawers.",
          value: {
            base: '0 1px 0 rgba(16,32,29,.08), 0 10px 24px -12px rgba(16,32,29,.35)',
            _dark: '0 1px 0 rgba(0,0,0,.4), 0 12px 28px -14px rgba(0,0,0,.8)',
          },
        },
      },
    },
    tokens: {
      // Corners by the size of the thing; `full` for anything round.
      radii: {
        label: { description: 'Labels and tags.', value: '6px' },
        control: { description: 'Buttons, fields, menus.', value: '10px' },
        card: { description: 'Cards, and the pictures in them.', value: '14px' },
        panel: {
          description: "Panels: a page's main panel, the diary, the cover story.",
          value: '20px',
        },
      },
      // Loaded in root.jsx.
      fonts: {
        heading: {
          description: 'Titles, in Poppins semibold.',
          value: "'Poppins', ui-sans-serif, system-ui, sans-serif",
        },
        body: {
          description: 'Everything else, in Inter.',
          value:
            "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        },
      },
      animations: {
        highlight: {
          description: 'A place picked on the places page pulses once.',
          value: `highlight 500ms ease-in-out 500ms`,
        },
      },
    },
    // v2 `withDefaultVariant({ variant: 'filled', components: ['Input',
    // 'Textarea'] })`. The v2 `filled` variant maps to v3 `subtle`. The partial
    // recipe deep-merges into the base recipe, overriding only what's listed.
    // `subtle` fills with bg.muted, the same gray as the page background, so
    // fields were invisible; fill them with a colour that contrasts instead.
    recipes: {
      // The site's four buttons. `solid` (the default) is the primary
      // action, one per screen, in green. `outline` is every other action,
      // on a pale green; with aria-pressed or aria-current it's a toggle,
      // sun yellow when on (Going, Follow, a picked plate or tab). `ghost` is
      // the quiet one: small actions and menus. Hover changes the colour; a
      // press presses in a little.
      button: {
        base: {
          borderRadius: 'control',
          fontWeight: 'semibold',
          transition:
            'background-color 150ms ease-out, border-color 150ms ease-out, transform 100ms ease-out',
          _active: { transform: 'scale(0.98)' },
        },
        variants: {
          variant: {
            solid: {
              bg: 'colorPalette.solid',
              color: 'colorPalette.contrast',
              borderWidth: '2px',
              borderColor: 'colorPalette.solid',
              // Darker under the pointer, whatever the palette: the site's
              // green, or red for the Delete in a confirmation.
              _hover: { filter: 'brightness(0.82)' },
              _expanded: { filter: 'brightness(0.82)' },
            },
            // Filled with a pale version of the palette's colour, the
            // site's green or red for a Delete; the border stays, the
            // fill's own colour, so the button keeps its size.
            outline: {
              bg: 'colorPalette.muted',
              color: 'colorPalette.fg',
              borderWidth: '2px',
              borderColor: 'transparent',
              _hover: { bg: 'colorPalette.emphasized' },
              _expanded: { bg: 'colorPalette.emphasized' },
              '&:is([aria-pressed=true], [aria-current=page])': {
                bg: 'sun',
                color: 'onPop',
                _hover: { bg: 'sun' },
              },
            },
            ghost: {
              bg: 'transparent',
              color: 'ink',
              _hover: { bg: 'surface' },
              _expanded: { bg: 'surface' },
            },
            // A button that reads as a link: Show all, Change.
            plain: { color: 'ink', _hover: { color: 'primary.fg' } },
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
            // The homepage's introduction: large, tight only because it's large.
            cover: {
              fontSize: { base: '2.6rem', sm: '3.4rem', md: '4rem' },
              lineHeight: '1.02',
              fontWeight: '600',
              letterSpacing: '-0.03em',
            },
          },
        },
      },
      // Code: ink on the page colour, with a hairline.
      code: {
        variants: {
          variant: {
            subtle: {
              bg: 'canvas',
              color: 'ink',
              boxShadow: 'inset 0 0 0 1px var(--chakra-colors-rule)',
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
