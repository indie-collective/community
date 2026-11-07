// The studios, associations and publishers pages share OrgListPage.
import { expect, within } from 'storybook/test';

import Associations from '../../routes/associations';
import Publishers from '../../routes/publishers';
import Studios from '../../routes/studios';
import { associations, facets, member, studios } from '../fixtures';

const data = (orgs) => ({ orgs, hasMore: true, page: 1, total: 412, facets, selected: {} });

export default {
  title: 'Pages/Lists',
  parameters: { layout: 'fullscreen' },
};

export const StudiosPage = {
  render: () => <Studios />,
  parameters: { router: { currentUser: member, url: '/studios', path: 'studios', loader: () => data(studios) } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('heading', { level: 1, name: 'Studios' })).toBeVisible();
  },
};

export const AssociationsPage = {
  render: () => <Associations />,
  parameters: { router: { url: '/associations', path: 'associations', loader: () => data(associations) } },
};

export const PublishersPage = {
  render: () => <Publishers />,
  parameters: {
    router: {
      url: '/publishers',
      path: 'publishers',
      loader: () => data(studios.slice(0, 3).map((org) => ({ ...org, type: 'publisher' }))),
    },
  },
};
