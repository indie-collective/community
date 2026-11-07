import { expect, within } from 'storybook/test';

import TagList from './TagList';

const tags = [
  { id: 't1', name: 'Platformer' },
  { id: 't2', name: 'Co-op' },
  { id: 't3', name: 'Pixel art' },
];

export default {
  title: 'Labels/TagList',
  component: TagList,
  args: { tags },
};

// #201: a list, so screen readers read the tags as separate items.
export const Default = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Tags' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  },
};

// On a game's page, each tag filters the games list.
export const Linked = {
  args: { linked: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Co-op' })).toHaveAttribute(
      'href',
      expect.stringContaining('/games')
    );
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
