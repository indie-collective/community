import { expect, within } from 'storybook/test';

import PersonLink from './PersonLink';

export default { title: 'Profile/PersonLink', component: PersonLink };

export const Default = {
  args: { username: 'camille' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: /camille/ })).toHaveAttribute('href', '/people/camille');
  },
};

// Someone who deleted their account.
export const Unknown = { args: { username: null } };
