import { expect, within } from 'storybook/test';

import SourceCredit from './SourceCredit';

const about = 'A small studio making cozy puzzle games.';

export default {
  title: 'Labels/SourceCredit',
  component: SourceCredit,
  args: {
    field: 'about',
    value: about,
    sources: [{ source: 'steam', url: 'https://store.steampowered.com/', filled: { about } }],
  },
};

// Where an imported description came from.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /Steam/ })).toBeVisible();
  },
};
