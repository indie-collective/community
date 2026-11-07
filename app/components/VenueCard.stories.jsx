import { expect, within } from 'storybook/test';

import VenueCard from './VenueCard';
import { PLACES } from '../stories/fixtures';

export default {
  title: 'Cards/VenueCard',
  component: VenueCard,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  args: { id: 'v1', slug: 'le-lieu-unique', name: 'Le Lieu Unique', location: PLACES.nantes },
};

export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Nantes, France')).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
