import { expect, within } from 'storybook/test';

import Empty, { EmptyAction } from './Empty';

export default {
  title: 'Labels/Empty',
  component: Empty,
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};

// An empty section.
export const Section = {
  args: { children: 'Nothing planned here yet', action: <EmptyAction to="/events/create">Add an event</EmptyAction> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /Add an event/ })).toHaveAttribute('href', '/events/create');
  },
};

// A whole list with nothing in it.
export const List = { args: { ...Section.args, picture: true, children: 'No upcoming events yet' } };

export const NothingToAdd = { args: { children: 'No tags recorded this year' } };

export const Dark = { ...Section, globals: { colorMode: 'dark' } };
