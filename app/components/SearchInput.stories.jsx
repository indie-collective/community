import { expect, within } from 'storybook/test';

import SearchInput from './SearchInput';

export default {
  title: 'Search/SearchInput',
  component: SearchInput,
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  parameters: {
    router: {
      // Suggestions as the header's search asks for them.
      routes: [{ path: 'search', loader: () => ({ games: [], orgs: [], events: [], people: [] }) }],
    },
  },
};

export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByPlaceholderText('Search')).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
