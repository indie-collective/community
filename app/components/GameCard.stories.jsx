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
  args: { entities: [{ id: 's1', name: 'Pixel Moss' }] },
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

// The homepage's wall: the same card, a little off-straight until the
// pointer is on it.
export const Tilted = {
  args: { tilt: -1.2, entities: [{ id: 's1', name: 'Pixel Moss' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Handmade Gold Sausages' })).toHaveAttribute('href', '/game/game-1');
    await expect(canvas.getByText('Pixel Moss')).toBeVisible();
  },
};

// On an event page, for signed-in people: a button to take it off the list.
export const Removable = {
  args: { onRemove: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Remove Handmade Gold Sausages' })).toBeVisible();
  },
};
