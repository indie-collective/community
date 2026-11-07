import { expect, within } from 'storybook/test';

import HomePage from '../../routes/index';
import {
  associations,
  events,
  games,
  mapPoints,
  member,
  studios,
} from '../fixtures';

const data = (currentUser = null) => ({
  games,
  studios,
  associations,
  eventsToCome: events,
  joinedEventsToCome: currentUser ? events.slice(1, 2) : [],
  placesCount: mapPoints.length,
  placesPoints: mapPoints,
  counts: currentUser
    ? { games: null, orgs: null, events: null }
    : { games: 1284, orgs: 412, events: 96 },
  currentUser,
});

export default {
  title: 'Pages/Home',
  component: HomePage,
  parameters: { layout: 'fullscreen', router: { loader: () => data() } },
};

// Visitors get the introduction, the counts and the invitation to add.
export const SignedOut = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { level: 1 })).toHaveTextContent(
      'The indie game scene, mapped by its community'
    );
    await expect(canvas.getByRole('heading', { name: "Add what's missing" })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Upcoming events' })).toBeVisible();
  },
};

// Members skip the introduction and see the events they're going to.
export const SignedIn = {
  parameters: {
    router: { currentUser: member, loader: () => data(member) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('region', { name: 'Your next events' })).toBeVisible();
    await expect(canvas.queryByRole('heading', { name: "Add what's missing" })).toBeNull();
  },
};

export const Dark = { ...SignedOut, globals: { colorMode: 'dark' } };
