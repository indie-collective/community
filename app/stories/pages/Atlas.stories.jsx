import { expect, within } from 'storybook/test';

import Places from '../../routes/places';
import { associations, events, studios } from '../fixtures';

const contents = [
  { code: 'BE', name: 'Belgium', count: 2 },
  { code: 'CA', name: 'Canada', count: 2 },
  { code: 'FR', name: 'France', count: 6 },
  { code: 'DE', name: 'Germany', count: 2 },
];

export default {
  title: 'Pages/Atlas',
  component: Places,
  parameters: {
    layout: 'fullscreen',
    router: {
      loader: () => ({
        orgs: [...studios, ...associations],
        events: events
          .filter((e) => e.location)
          .map((e) => ({ ...e, type: 'event', logo: null })),
        focus: null,
        contents,
      }),
    },
  },
};

// The map with its regions, what's in view, and the countries. The tiles
// come from OpenStreetMap, so they only show with a connection.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { level: 1, name: 'Atlas' })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Countries' })).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
