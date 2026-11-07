import { expect, within } from 'storybook/test';

import GameForm from './GameForm';

export default {
  title: 'Forms/GameForm',
  component: GameForm,
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  parameters: {
    router: {
      routes: [
        { path: 'duplicates', loader: () => ({ matches: [] }) },
        { path: 'search-org', loader: () => [] },
      ],
    },
  },
  args: { method: 'post' },
};

export const Create = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText(/name/i)).toBeVisible();
  },
};

export const Dark = { ...Create, globals: { colorMode: 'dark' } };
