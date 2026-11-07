import { HStack } from '@chakra-ui/react';
import { expect, userEvent, within } from 'storybook/test';

import { AddToCalendar, SubscribeMenu } from './CalendarMenus';
import { events } from '../stories/fixtures';

export default {
  title: 'Events/CalendarMenus',
  component: SubscribeMenu,
};

// An event's "Add to calendar", and a list's "Subscribe".
export const Both = {
  render: () => (
    <HStack gap={3}>
      <AddToCalendar event={events[0]} path="/event/e1" place="Nantes, France" />
      <SubscribeMenu calendarPath="/calendar.ics" feedPath="/events/feed.xml" />
    </HStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /subscribe/i }));
    const page = within(canvasElement.ownerDocument.body);
    await expect((await page.findAllByRole('menuitem')).length).toBeGreaterThan(0);
  },
};
