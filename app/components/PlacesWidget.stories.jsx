import { expect, within } from 'storybook/test';

import PlacesWidget from './PlacesWidget';
import { mapPoints } from '../stories/fixtures';

export default {
  title: 'Map/PlacesWidget',
  component: PlacesWidget,
  decorators: [(Story) => <div style={{ maxWidth: 900 }}><Story /></div>],
  args: { placesCount: mapPoints.length, placesPoints: mapPoints },
};

// The homepage's atlas: a dot per organisation, and a way in. The tiles come
// from OpenStreetMap, so they only show with a connection.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /Open the atlas/ })).toHaveAttribute('href', '/places');
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
