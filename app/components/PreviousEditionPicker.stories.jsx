import { expect, userEvent, within } from 'storybook/test';

import PreviousEditionPicker from './PreviousEditionPicker';

export default {
  title: 'Forms/PreviousEditionPicker',
  component: PreviousEditionPicker,
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  parameters: {
    router: {
      routes: [
        { path: 'search-event', loader: () => [{ id: 'e0', name: 'Nantes Game Jam 2025', starts_at: '2025-11-14T17:00:00.000Z' }] },
      ],
    },
  },
};

// An event's earlier edition, found by name.
export const Search = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'Nantes');
    await expect(await canvas.findByText(/Nantes Game Jam 2025/)).toBeVisible();
  },
};
