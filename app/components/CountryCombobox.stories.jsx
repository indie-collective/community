import { expect, userEvent, within } from 'storybook/test';

import CountryCombobox from './CountryCombobox';

export default {
  title: 'Search/CountryCombobox',
  component: CountryCombobox,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  args: {
    countries: [
      { country_code: 'FR', _count: 120 },
      { country_code: 'BE', _count: 18 },
      { country_code: 'CA', _count: 64 },
    ],
  },
};

// #205: typing narrows the list.
export const Default = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('combobox');
    await userEvent.click(box);
    await userEvent.type(box, 'bel');
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('option', { name: /Belgium/ })).toBeInTheDocument();
  },
};

export const Chosen = { args: { defaultValue: 'FR' } };
