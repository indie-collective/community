import { expect, within } from 'storybook/test';

import GameCard from './GameCard';

export default {
  title: 'Cards/GameCard',
  component: GameCard,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  args: {
    id: 'game-1',
    name: 'Handmade Gold Sausages',
    tags: [
      { id: 't1', name: 'Platformer' },
      { id: 't2', name: 'Co-op' },
    ],
  },
};

// #173: the title is the card's link. It inherits the text colour (not the
// green link palette) and its ::before overlay makes the whole card clickable.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Handmade Gold Sausages' });
    await expect(link).toHaveAttribute('href', '/game/game-1');

    const heading = link.closest('h3');
    await expect(getComputedStyle(link).color).toBe(getComputedStyle(heading).color);
    await expect(getComputedStyle(link, '::before').position).toBe('absolute');

    await expect(canvas.getByText('Platformer')).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
