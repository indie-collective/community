import { Grid } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

import EventCard from './EventCard';
import cover from '../stories/sample-cover.svg';

export default {
  title: 'Cards/EventCard',
  component: EventCard,
  decorators: [(Story) => <div style={{ width: 340 }}><Story /></div>],
  args: {
    id: 'event-1',
    name: 'Jerde, Padberg and Greenholt Conference',
    starts_at: '2026-04-25T13:23:00.000Z',
    ends_at: '2026-04-27T18:00:00.000Z',
    time_zone: 'Europe/Paris',
    location: { city: 'Burien', region: 'Washington', country_code: 'AF' },
  },
};

// A ticket: the date as a calendar page on the stub, then the name, when
// and where.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Jerde, Padberg and Greenholt Conference' })
    ).toHaveAttribute('href', '/event/event-1');
    await expect(canvas.getByText('25')).toBeVisible();
    await expect(canvas.getByText(/Burien, AF/)).toBeVisible();
  },
};

// In a list, its picture fills the stub.
export const WithPicture = { args: { cover: { thumbnail_url: cover } } };

// In a grid, its picture is a strip on top, torn along a perforation.
export const Grid3 = {
  name: 'In a grid',
  decorators: [(Story) => <div style={{ width: 960 }}><Story /></div>],
  render: (args) => (
    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
      <EventCard {...args} layout="grid" cover={{ thumbnail_url: cover }} />
      <EventCard {...args} layout="grid" id="event-2" name="Winter Jam" />
      <EventCard {...args} layout="grid" id="event-3" name="Showcase" status="canceled" />
    </Grid>
  ),
};

// Their own events carry "You're going"; online and hybrid ones say so.
export const GoingOnline = {
  args: { going: true, attendance: 'hybrid' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/going/i)).toBeVisible();
    await expect(canvas.getByText(/hybrid/i)).toBeVisible();
  },
};

export const Canceled = {
  args: { status: 'canceled' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/canceled/i)).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
