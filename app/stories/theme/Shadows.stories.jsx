import { Box } from '@chakra-ui/react';
import { expect } from 'storybook/test';

import { BothModes, TokenPage, TokenRow } from './TokenParts';
import { flatten, panels, semanticTokens } from './tokens';

export default { title: 'Theme/Shadows' };

const shadows = flatten(semanticTokens.shadows);

export const Elevation = {
  render: () => (
    <TokenPage
      title="Shadows"
      intro="Three, nothing else: shadow='raised', 'raisedHover' or 'lift'. Each is shown in light and dark mode."
    >
      <Box>
        {shadows.map((token) => (
          <TokenRow key={token.name} {...token}>
            <BothModes h="150px">
              <Box
                data-sample
                shadow={token.name}
                bg="surface"
                borderRadius="card"
                w="120px"
                h="84px"
              />
            </BothModes>
          </TokenRow>
        ))}
      </Box>
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    for (const { name } of shadows) {
      const { light, dark } = panels(canvasElement, name);
      const shadow = (el) => getComputedStyle(el).boxShadow;
      await expect(shadow(light), name).not.toBe('none');
      // Each shadow has its own light value: pointing a shadow at Chakra's
      // `xs` once gave light mode the dark one, a 64% black.
      await expect(shadow(dark), name).not.toBe(shadow(light));
    }
  },
};
