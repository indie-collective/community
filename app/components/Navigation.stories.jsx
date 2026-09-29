import { expect, within } from 'storybook/test';

import Navigation from './Navigation';

export default {
  title: 'Layout/Navigation',
  component: Navigation,
  parameters: { layout: 'fullscreen' },
};

export const SignedOut = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(canvas.getByPlaceholderText('Search')).toBeVisible();
  },
};

export const SignedIn = {
  parameters: {
    router: {
      currentUser: { id: 'p1', username: 'member', first_name: 'Jean-Michel', isAdmin: false },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Jean-Michel')).toBeVisible();
  },
};

// #173: in dark mode the search input stayed white (a v2-only gray.750 token)
// and the navigation bars took the page's own colour.
export const Dark = {
  globals: { colorMode: 'dark' },
  play: async ({ canvasElement }) => {
    const search = await within(canvasElement).findByPlaceholderText('Search');
    await expect(getComputedStyle(search).backgroundColor).not.toBe('rgb(255, 255, 255)');
  },
};
