import { Box, Flex } from '@chakra-ui/react';
import { expect } from 'storybook/test';

import { system } from '../../theme';
import { BothModes, TokenPage, TokenRow } from './TokenParts';
import { flatten, panels, semanticTokens } from './tokens';

export default { title: 'Theme/Shadows' };

const shadows = flatten(semanticTokens.shadows);

// Chakra's overlays, which the theme sets on `lift`.
const OVERLAYS = {
  menu: 'content',
  popover: 'content',
  hoverCard: 'content',
  dialog: 'content',
  drawer: 'content',
  combobox: 'content',
  select: 'content',
  tooltip: 'content',
  toast: 'root',
};

// A ticket with notches in its sides, as the event card's: a box shadow
// would be cut off by them, a filter follows them.
const ticket = {
  bg: 'surface',
  w: '140px',
  h: '84px',
  css: {
    mask: 'radial-gradient(circle 9px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 9px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat',
  },
};

const Sample = ({ name }) => {
  if (name === 'raisedDrop')
    return (
      <Box data-sample filter="var(--chakra-shadows-raised-drop)">
        <Box {...ticket} />
      </Box>
    );
  if (name === 'pop')
    return (
      <Flex
        bg="sun"
        alignSelf="stretch"
        flex={1}
        align="center"
        justify="center"
        mx={-4}
      >
        <Box
          data-sample
          shadow="pop"
          bg="onPop"
          color="sun"
          fontWeight="semibold"
          borderRadius="control"
          px={4}
          py={2}
          transform="translate(-2px, -2px)"
        >
          Add an event
        </Box>
      </Flex>
    );
  return (
    <Box
      data-sample
      shadow={name}
      bg="surface"
      borderRadius="card"
      w="120px"
      h="84px"
    />
  );
};

export const Elevation = {
  render: () => (
    <TokenPage
      title="Shadows"
      intro="Three for depth, shadow='raised', 'raisedHover' or 'lift', and two forms of them. Chakra's menus, dialogs, pickers, tooltips and toasts use lift. Each is shown in light and dark mode."
    >
      <Box>
        {shadows.map((token) => (
          <TokenRow key={token.name} {...token}>
            <BothModes h="150px">
              <Sample name={token.name} />
            </BothModes>
          </TokenRow>
        ))}
      </Box>
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    for (const { name, value } of shadows) {
      const { light, dark } = panels(canvasElement, name);
      const shadow = (el) =>
        name === 'raisedDrop'
          ? getComputedStyle(el).filter
          : getComputedStyle(el).boxShadow;
      await expect(shadow(light), name).not.toMatch(/^none$|^$/);
      // A shadow with its own dark value shows it in dark mode: pointing a
      // shadow at Chakra's `xs` once gave light mode the dark one, a 64% black.
      if (typeof value !== 'string')
        await expect(shadow(dark), name).not.toBe(shadow(light));
    }
    for (const [recipe, slot] of Object.entries(OVERLAYS)) {
      await expect(
        system.getSlotRecipe(recipe).base[slot].boxShadow,
        recipe
      ).toBe('lift');
    }
  },
};
