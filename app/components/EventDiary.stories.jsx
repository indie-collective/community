import { expect, userEvent, within } from 'storybook/test';

import EventDiary from './EventDiary';
import { TODAY, events, member } from '../stories/fixtures';

export default {
  title: 'Events/EventDiary',
  component: EventDiary,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ padding: 24, maxWidth: 1040 }}><Story /></div>],
  args: {
    month: TODAY.slice(0, 7),
    initialToday: TODAY,
    monthEvents: events.filter((e) => e.starts_at.startsWith('2026-11')),
    upcoming: events,
    empty: 'No upcoming events yet.',
  },
};

// The events page's diary: the month, and what's on beside it.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /November 2026/ })).toBeVisible();
    // Each event is a bar on the calendar and a ticket in the agenda.
    await expect(canvas.getAllByRole('link', { name: 'Nantes Game Jam' }).length).toBeGreaterThan(1);
  },
};

// Picking a day starts the agenda there.
export const PickADay = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /November 21/ }));
    await expect(canvas.getByRole('button', { name: 'Show all' })).toBeVisible();
    await expect(canvas.queryAllByRole('link', { name: 'Indie Showcase Night' })).toHaveLength(1);
  },
};

// Their own events are sun yellow, on the calendar and in its key.
export const SignedIn = {
  args: { currentUserId: member.id },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText(/going/i).length).toBeGreaterThan(0);
  },
};

export const Empty = { args: { monthEvents: [], upcoming: [] } };

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
