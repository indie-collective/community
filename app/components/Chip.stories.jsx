import { HStack } from '@chakra-ui/react';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import Chip from './Chip';

export default {
  title: 'Labels/Chip',
  component: Chip,
};

export const Tags = {
  render: () => (
    <HStack gap={1}>
      <Chip>Platformer</Chip>
      <Chip>Co-op</Chip>
      <Chip size="sm">Pixel art</Chip>
    </HStack>
  ),
};

const Filter = () => {
  const [on, setOn] = useState('Puzzle');
  return (
    <HStack gap={1}>
      {[
        ['Puzzle', 33],
        ['Platformer', 41],
        ['Narrative', 12],
      ].map(([name, count]) => (
        <Chip key={name} pressed={on === name} count={count} onClick={() => setOn(name)}>
          {name}
        </Chip>
      ))}
    </HStack>
  );
};

// Filtering: toggles with a count, sun while on.
export const Filtering = {
  render: () => <Filter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Narrative/ }));
    await expect(canvas.getByRole('button', { name: /Narrative/ })).toHaveAttribute('aria-pressed', 'true');
  },
};

// A filter already applied, with an × to take it off.
export const Removable = {
  args: { onRemove: () => {}, removeLabel: 'Show every city', children: 'In Nantes' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Show every city' })).toBeVisible();
  },
};

export const Dark = { ...Tags, globals: { colorMode: 'dark' } };
