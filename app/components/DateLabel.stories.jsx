import { expect, within } from 'storybook/test';

import DateLabel from './DateLabel';

export default {
  title: 'Events/DateLabel',
  component: DateLabel,
  args: { value: '2026-11-13T17:00:00.000Z', timeZone: 'Europe/Paris' },
};

// #204: the day in the event's own time zone.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('13')).toBeVisible();
  },
};

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
