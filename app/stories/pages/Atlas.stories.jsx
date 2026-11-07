import { expect, within } from 'storybook/test';

import Places from '../../routes/places';
import { focusOn } from '../../utils/mapFocus';
import { associations, events, studios } from '../fixtures';
import cover from '../sample-cover.svg';

// Some with a logo, some without: those show their mark alone.
const withLogos = (list) =>
  list.map((item, i) => (i % 2 === 0 ? { ...item, logo: { thumbnail_url: cover } } : item));

// A little apart, as real places are: in the fixtures a city's studio and
// association share a point.
const apart = (list, by) =>
  list.map((item) => ({
    ...item,
    location: item.location && {
      ...item.location,
      latitude: item.location.latitude + by,
      longitude: item.location.longitude + by,
    },
  }));

const loader = (focus) => () => ({
  orgs: withLogos([...studios, ...apart(associations, 0.02)]),
  events: apart(events.filter((e) => e.location), -0.02).map((e) => ({ ...e, type: 'event', logo: null })),
  focus,
  contents,
});

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
      loader: loader(null),
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

// Zoomed in on Nantes: each place its own marker, with its logo when it has
// one.
export const ZoomedIn = {
  parameters: {
    router: {
      loader: loader(
        focusOn([
          { latitude: 47.1, longitude: -1.7 },
          { latitude: 47.35, longitude: -1.4 },
        ])
      ),
    },
  },
};
