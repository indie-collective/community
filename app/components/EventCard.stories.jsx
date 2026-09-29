import { expect, within } from 'storybook/test';

import EventCard from './EventCard';

export default {
  title: 'Cards/EventCard',
  component: EventCard,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  args: {
    id: 'event-1',
    name: 'Jerde, Padberg and Greenholt Conference',
    starts_at: '2026-04-25T13:23:00.000Z',
    ends_at: '2026-04-27T18:00:00.000Z',
    location: { city: 'Burien', region: 'Washington', country_code: 'AF' },
  },
};

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Jerde, Padberg and Greenholt Conference' })
    ).toHaveAttribute('href', '/event/event-1');
    await expect(canvas.getByText('Burien, AF')).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
