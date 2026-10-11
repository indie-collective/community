import { useLoaderData } from 'react-router';

import { loadOrgList } from '../utils/orgList.server';
import OrgListPage from '../components/OrgListPage';
import { pageMeta } from '../utils/meta';

export const loader = ({ request }) => loadOrgList(request, 'studio');

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Studios',
    description: 'Video game studios around you and all over the world.',
    path: location.pathname,
  });

const Studios = () => <OrgListPage type="studio" data={useLoaderData()} />;

export default Studios;
