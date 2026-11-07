import { expect, within } from 'storybook/test';

import CountriesTable from './CountriesTable';
import { countries } from '../stories/fixtures';

export default {
  title: 'Map/CountriesTable',
  component: CountriesTable,
  args: { countries },
};

// #258: the countries as a periodic table, one tile each.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /^FR, France/ })).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
