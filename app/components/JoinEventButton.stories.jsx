import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import JoinEventButton from './JoinEventButton';

const join = fn(() => null);
const leave = fn(() => null);

export default {
  title: 'Events/JoinEventButton',
  component: JoinEventButton,
  parameters: {
    router: {
      routes: [
        { path: 'event/:id/join', action: join },
        { path: 'event/:id/leave', action: leave },
      ],
    },
  },
  args: { eventId: 'event-1', children: "Let's go!" },
};

export const NotGoing = {
  args: { isGoing: false },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: "Let's go!" }));
    await waitFor(() => expect(join).toHaveBeenCalled());
    await expect(join.mock.calls.at(-1)[0].params.id).toBe('event-1');
  },
};

export const Going = {
  args: { isGoing: true, children: 'Going' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /going/i }));
    await waitFor(() => expect(leave).toHaveBeenCalled());
  },
};
