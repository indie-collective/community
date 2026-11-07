import { expect, within } from 'storybook/test';

import GameTimeline from './GameTimeline';
import { events, member } from '../stories/fixtures';

const milestones = [
  { id: 'm1', kind: 'prototype', date: '2024-03-01', date_precision: 'month' },
  { id: 'm2', kind: 'announced', date: '2025-01-15', date_precision: 'day', note: 'At the Nantes showcase' },
  { id: 'm3', kind: 'demo', date: '2025-10-01', date_precision: 'month' },
  { id: 'm4', kind: 'released', date: '2026-09-12', date_precision: 'day' },
];

export default {
  title: 'Games/GameTimeline',
  component: GameTimeline,
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  args: { gameId: 'g1', milestones, events: events.slice(0, 1) },
};

export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Prototype/)).toBeVisible();
  },
};

// Members can add a milestone.
export const SignedIn = { args: { currentUser: member } };

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
