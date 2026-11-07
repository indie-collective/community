import { HStack } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

import Sticker from './Sticker';

export default {
  title: 'Labels/Sticker',
  component: Sticker,
};

// Status on a card, one tone per meaning: sun for yours, lilac for online,
// coral for canceled.
export const Tones = {
  render: () => (
    <HStack gap={2}>
      <Sticker tone="sun">{"You're going"}</Sticker>
      <Sticker tone="lilac">Online</Sticker>
      <Sticker tone="coral">Canceled</Sticker>
    </HStack>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Canceled')).toBeVisible();
  },
};

// The homepage's cover story: round, at an angle, landing once.
export const Round = {
  args: { round: true, land: true, children: 'Cover story' },
  parameters: { layout: 'centered' },
};

export const Dark = { ...Tones, globals: { colorMode: 'dark' } };
