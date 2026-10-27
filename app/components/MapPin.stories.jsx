import { expect, within } from 'storybook/test';

import { pinColor } from '../utils/orgTypes';
import MapPin from './MapPin';

export default {
  title: 'Maps/MapPin',
  component: MapPin,
};

// #321: studios, associations and events each get their own colour, not
// the same grey (a raw token on the <svg> isn't a CSS colour).
export const ByType = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {['studio', 'association', 'event'].map((type) => (
        <div key={type} data-type={type}>
          <MapPin color={pinColor(type)} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pins = within(canvasElement).getAllByTestId('map-pin');
    const colors = pins.map((pin) => getComputedStyle(pin).color);
    const text = getComputedStyle(canvasElement).color;

    await expect(new Set(colors).size).toBe(3);
    for (const color of colors) await expect(color).not.toBe(text);
  },
};

export const Dark = { ...ByType, globals: { colorMode: 'dark' } };
