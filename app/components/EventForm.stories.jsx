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
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/name/i)).toBeVisible();
    // The cover once collapsed to nothing, placeholder and preview with it.
    const cover = canvas.getByAltText('Event cover');
    await expect(cover.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(cover.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};

export const Dark = { ...Create, globals: { colorMode: 'dark' } };
