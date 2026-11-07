import { expect, within } from 'storybook/test';

import EventMapCard from './EventMapCard';
import { events } from '../stories/fixtures';

export default {
  title: 'Cards/EventMapCard',
  component: EventMapCard,
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  args: events[0],
};

// An upcoming event in the atlas's list (#211).
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Nantes Game Jam' })).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
