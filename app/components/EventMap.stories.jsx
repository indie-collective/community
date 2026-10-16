import { expect, within } from 'storybook/test';

import EventMap from './EventMap';

export default {
  title: 'Maps/EventMap',
  component: EventMap,
  decorators: [(Story) => <div style={{ width: 720 }}><Story /></div>],
  args: {
    location: { street: '99 Rue de Rivoli', city: 'Paris', latitude: 48.8606, longitude: 2.3376 },
  },
};

// #322: the venue gets an event pin, and the map opens it in a maps app.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The tiles and pin draw once hydrated (ClientOnly).
    await expect(await canvas.findByTestId('map-pin')).toBeInTheDocument();
    const link = canvas.getByRole('link', { name: 'Open in Maps' });
    await expect(link).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=48.8606,2.3376'
    );
    await expect(link).toHaveAttribute('target', '_blank');
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
