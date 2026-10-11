import { useLoaderData } from 'react-router';

import { loadOrgList } from '../utils/orgList.server';
import OrgListPage from '../components/OrgListPage';
import { pageMeta } from '../utils/meta';

export const loader = ({ request }) => loadOrgList(request, 'association');

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Associations',
    description:
      'Video game related associations around you and all over the world.',
    path: location.pathname,
  });

const Associations = () => (
  <OrgListPage type="association" data={useLoaderData()} />
);

export default Associations;
