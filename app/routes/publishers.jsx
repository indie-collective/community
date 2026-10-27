import { useLoaderData } from 'react-router';

import { loadPublisherList } from '../utils/orgList.server';
import OrgListPage from '../components/OrgListPage';
import { pageMeta } from '../utils/meta';

export const loader = ({ request }) => loadPublisherList(request);

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Publishers',
    description:
      'Who publishes indie games, and which ones: find publishers for games like yours.',
    path: location.pathname,
  });

// #331: studios and associations that published games, from their games' roles.
const Publishers = () => <OrgListPage type="publisher" data={useLoaderData()} />;

export default Publishers;
