import { expect, within } from 'storybook/test';

import AvatarButton from './AvatarButton';
import { member } from '../stories/fixtures';

export default {
  title: 'Layout/AvatarButton',
  component: AvatarButton,
};

export const SignedOut = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('link', { name: /sign in/i })).toBeVisible();
  },
};

export const SignedIn = {
  parameters: { router: { currentUser: member } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Camille')).toBeVisible();
  },
};
