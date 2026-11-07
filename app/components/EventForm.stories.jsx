import { expect, within } from 'storybook/test';

import EventForm from './EventForm';

export default {
  title: 'Forms/EventForm',
  component: EventForm,
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  parameters: {
    router: {
      routes: [
        { path: 'duplicates', loader: () => ({ matches: [] }) },
        { path: 'search-event', loader: () => [] },
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
