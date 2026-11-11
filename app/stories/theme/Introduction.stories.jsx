import { Box, Flex, Grid, Heading, List, Stack, Text } from '@chakra-ui/react';
import { expect } from 'storybook/test';

import { TokenPage } from './TokenParts';
import { flatten, semanticTokens, tokens } from './tokens';

export default {
  title: 'Theme/Introduction',
  // A page to read, not a component to try: no Controls panel under it.
  parameters: { layout: 'padded', options: { showPanel: false } },
};

// Each Theme page, as Storybook's own address for it, so a card opens it
// in the Storybook around this one.
const PAGES = [
  {
    title: 'Colours',
    path: 'theme-colors--palette',
    about:
      'Paper and ink, the two greens, and three colours that only mark state.',
    preview: () => (
      <Flex gap={1.5}>
        {[
          'canvas',
          'surface',
          'ink',
          'muted',
          'brand',
          'brandDeep',
          'sun',
          'coral',
          'lilac',
        ].map((name) => (
          <Box
            key={name}
            bg={name}
            w="22px"
            h="22px"
            borderRadius="label"
            borderWidth="1px"
            borderColor="rule"
          />
        ))}
      </Flex>
    ),
  },
  {
    title: 'Typography',
    path: 'theme-typography--scale',
    about:
      'Poppins for titles, Inter for everything else; one heading size per use.',
    preview: () => (
      <Flex align="baseline" gap={3}>
        <Text
          fontFamily="heading"
          fontWeight="semibold"
          fontSize="3xl"
          lineHeight="1"
        >
          Aa
        </Text>
        <Text fontFamily="body" fontSize="2xl" lineHeight="1">
          Aa
        </Text>
      </Flex>
    ),
  },
  {
    title: 'Shadows',
    path: 'theme-shadows--elevation',
    about: 'Three depths: what rests, what is under the pointer, what floats.',
    preview: () => (
      <Flex gap={3}>
        {['raised', 'raisedHover', 'lift'].map((name) => (
          <Box
            key={name}
            shadow={name}
            bg="surface"
            borderRadius="label"
            w="34px"
            h="24px"
          />
        ))}
      </Flex>
    ),
  },
  {
    title: 'Radii',
    path: 'theme-radii--corners',
    about: 'Corners by the size of the thing: label, control, card, panel.',
    preview: () => (
      <Flex gap={3} align="flex-end">
        {['label', 'control', 'card', 'panel'].map((name, i) => (
          <Box
            key={name}
            borderRadius={name}
            borderWidth="2px"
            borderColor="ink"
            bg="surface"
            w={`${22 + i * 8}px`}
            h={`${16 + i * 5}px`}
          />
        ))}
      </Flex>
    ),
  },
  {
    title: 'Motion',
    path: 'theme-motion--keyframes',
    about:
      "Page transitions, lists rising in, the cover story's tilt and stickers.",
    preview: () => (
      <Flex gap={2} align="flex-end" h="28px">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            bg="surface"
            shadow="raised"
            borderRadius="label"
            w="26px"
            h="20px"
            animation={`rise 360ms cubic-bezier(0.2, 0, 0, 1) ${i * 90}ms both`}
          />
        ))}
      </Flex>
    ),
  },
];

const PRINCIPLES = [
  [
    'Paper and ink.',
    'The page is canvas, panels and cards are surface, text is ink, and secondary text is muted. Everything is tinted green, from the logo.',
  ],
  [
    'Green is the brand.',
    "One primary button per screen, in the site's green. Every other action is a pale green secondary button, and small actions are ghost buttons.",
  ],
  [
    'Colour marks state.',
    "Sun is what's selected or yours, coral is today or canceled, lilac is online. They're never decoration, and text on them is always onPop.",
  ],
  [
    'Three depths.',
    'Raised for what rests on the page, raisedHover under the pointer, lift for what floats above it. Menus, dialogs and pickers float.',
  ],
  [
    'Tokens by name.',
    "Use bg='surface', shadow='raised', borderRadius='card', never a hex value or a shadow written out. A new token needs a description in theme.js, and its page here shows it.",
  ],
];

const count = (group) => flatten(group).length;

export const Introduction = {
  name: 'Introduction',
  render: () => (
    <TokenPage
      title="Indie Collective design system"
      intro={`The look of community.indieco.xyz, written down: ${count(semanticTokens.colors)} colours, ${count(tokens.fonts)} fonts, ${count(semanticTokens.shadows)} shadows, ${count(tokens.radii)} radii, defined once in app/theme.js. Every page here reads that file, so what you see is what the site uses, in light and dark mode.`}
    >
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        {PAGES.map(({ title, path, about, preview: Preview }) => (
          <Box
            as="a"
            key={path}
            href={`/?path=/story/${path}`}
            target="_top"
            data-page={path}
            display="flex"
            flexDirection="column"
            gap={3}
            p={5}
            bg="surface"
            borderRadius="card"
            shadow="raised"
            transition="box-shadow 160ms ease-out, transform 160ms ease-out"
            _hover={{ shadow: 'raisedHover', transform: 'translateY(-2px)' }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: 'brand',
              outlineOffset: '2px',
            }}
          >
            {/* On the page colour, so white samples and their shadows show. */}
            <Flex
              h="72px"
              align="center"
              px={4}
              bg="canvas"
              borderRadius="control"
            >
              <Preview />
            </Flex>
            <Heading as="h2" size="md">
              {title}
            </Heading>
            <Text color="muted" fontSize="sm">
              {about}
            </Text>
          </Box>
        ))}
      </Grid>

      <Stack gap={3} maxW="680px">
        <Heading as="h2" size="lg">
          Principles
        </Heading>
        <List.Root as="ol" gap={3} ps={5}>
          {PRINCIPLES.map(([lead, rest]) => (
            <List.Item key={lead}>
              <Text as="span" fontWeight="semibold">
                {lead}
              </Text>{' '}
              {rest}
            </List.Item>
          ))}
        </List.Root>
      </Stack>

      <Stack gap={2} maxW="680px">
        <Heading as="h2" size="lg">
          Changing it
        </Heading>
        <Text>
          Change a token in app/theme.js, with a description of what it's for.
          Each page has a test that fails when a token is missing from it,
          doesn't resolve, or shows its light value in dark mode.
        </Text>
      </Stack>
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    // A card for every other Theme page.
    const shown = [...canvasElement.querySelectorAll('[data-page]')].map(
      (a) => a.dataset.page
    );
    await expect(shown).toEqual(PAGES.map((p) => p.path));
  },
};
