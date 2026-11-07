import { Heading, Text } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

import Card from './Card';
import CardLink from './CardLink';

export default {
  title: 'Cards/Card',
  component: Card,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};

// The base of every card. A clickable one rises under the pointer, and its
// CardLink covers the whole card.
export const Clickable = {
  render: () => (
    <Card isClickable p={4} rounded="xl" borderWidth="1px" borderColor="rule">
      <Heading as="h3" size="md">
        <CardLink to="/game/g1">Salt and Lanterns</CardLink>
      </Heading>
      <Text color="muted" fontSize="sm">The whole card is the link.</Text>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Salt and Lanterns' });
    await expect(link).toHaveAttribute('href', '/game/g1');
    await expect(getComputedStyle(link, '::before').position).toBe('absolute');
  },
};

export const Static = {
  render: () => (
    <Card p={4} rounded="xl" borderWidth="1px" borderColor="rule">
      <Text>Not clickable.</Text>
    </Card>
  ),
};

export const Dark = { ...Clickable, globals: { colorMode: 'dark' } };
