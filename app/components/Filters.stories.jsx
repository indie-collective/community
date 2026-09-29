import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import Filters from './Filters';

const loader = fn(({ request }) => new URL(request.url).search);

const facets = {
  countries: [
    { country_code: 'FR', _count: 12 },
    { country_code: 'BE', _count: 4 },
  ],
  years: [{ year: '2026' }, { year: '2025' }],
};

export default {
  title: 'Search/Filters',
  component: Filters,
  parameters: { router: { loader } },
};

const submittedSearch = () => loader.mock.results.at(-1).value;

// #172: none of the filters submitted (onValueChange on a DOM <select>,
// onCheckedChange with no event).
export const Organizations = {
  args: { facets, selected: {}, type: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    loader.mockClear();
    await userEvent.click(canvas.getByText('Has published games'));
    await waitFor(() => expect(submittedSearch()).toContain('has_games=on'));

    loader.mockClear();
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'BE');
    await waitFor(() => expect(submittedSearch()).toContain('country=BE'));
  },
};

export const Events = {
  args: { facets, selected: { period: 'upcoming' }, type: 'event' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    loader.mockClear();
    const [, period] = canvas.getAllByRole('combobox');
    await userEvent.selectOptions(period, '2025');
    await waitFor(() => expect(submittedSearch()).toContain('period=2025'));
    await expect(period).toHaveValue('2025');
  },
};
