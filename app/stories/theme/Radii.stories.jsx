import { Box, Flex } from '@chakra-ui/react';
import { expect } from 'storybook/test';

import { TokenPage, TokenRow } from './TokenParts';
import { flatten, tokens } from './tokens';

export default { title: 'Theme/Radii' };

const radii = flatten(tokens.radii);

export const Corners = {
  render: () => (
    <TokenPage
      title="Radii"
      intro="Corners by the size of the thing: borderRadius='card'. 'full' for anything round."
    >
      <Box>
        {radii.map((token) => (
          <TokenRow key={token.name} {...token}>
            <Flex
              h="100px"
              align="center"
              justify="center"
              bg="canvas"
              borderRadius="card"
            >
              <Box
                data-sample
                borderRadius={token.name}
                bg="surface"
                borderWidth="2px"
                borderColor="ink"
                w="120px"
                h="72px"
              />
            </Flex>
          </TokenRow>
        ))}
      </Box>
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    for (const { name, value } of radii) {
      const sample = canvasElement.querySelector(
        `[data-token="${name}"] [data-sample]`
      );
      await expect(getComputedStyle(sample).borderTopLeftRadius, name).toBe(
        value
      );
    }
  },
};
