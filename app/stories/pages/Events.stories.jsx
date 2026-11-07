import { expect, within } from 'storybook/test';

import Events from '../../routes/events';
import { TODAY, events, member, pastEvents } from '../fixtures';

const data = (currentUser = null) => ({
  today: TODAY,
  shownMonth: TODAY.slice(0, 7),
  monthEvents: events.filter((e) => e.starts_at.startsWith('2026-11')),
  events,
  pastEvents,
  facets: {
    countries: [
      { country_code: 'FR', _count: 3 },
      { country_code: 'BE', _count: 1 },
      { country_code: 'DE', _count: 1 },
    ],
    years: [{ year: '2026' }, { year: '2025' }],
  },
  selected: { period: 'upcoming' },
  currentUser,
});

export default {
  title: 'Pages/Events',
  component: Events,
  parameters: { layout: 'fullscreen', router: { loader: () => data() } },
};

// The diary, then what happened recently.
export const Upcoming = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { level: 1, name: 'Events' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: /November 2026/ })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Recently' })).toBeVisible();
  },
};

export const SignedIn = {
  parameters: { router: { currentUser: member, loader: () => data(member) } },
};

export const Dark = { ...Upcoming, globals: { colorMode: 'dark' } };
