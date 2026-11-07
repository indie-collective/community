import { expect, within } from 'storybook/test';

import OrgList from './OrgList';
import OrgListPage from './OrgListPage';
import { associations, member, studios } from '../stories/fixtures';

export default {
  title: 'Organisations/OrgList',
  component: OrgList,
  args: { orgs: studios, hasMore: true, page: 1 },
};

// A list of organisations that loads the next page on demand.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Pixel Moss' })).toHaveAttribute('href', '/org/s1');
    await expect(canvas.getByRole('button', { name: /more/i })).toBeVisible();
  },
};

// The studios, associations and publishers pages.
export const StudiosPage = {
  parameters: { layout: 'fullscreen', router: { currentUser: member } },
  render: () => (
    <OrgListPage
      type="studio"
      data={{
        orgs: studios,
        hasMore: false,
        page: 1,
        total: studios.length,
        facets: { countries: [{ country_code: 'FR', _count: 3 }] },
        selected: {},
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 1, name: 'Studios' })).toBeVisible();
  },
};

export const AssociationsPage = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <OrgListPage
      type="association"
      data={{ orgs: associations, hasMore: false, page: 1, total: associations.length, facets: { countries: [] }, selected: {} }}
    />
  ),
};
