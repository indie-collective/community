import { Box } from '@chakra-ui/react';
import { useLoaderData, useLocation } from 'react-router';

import { loadOrgList } from '../utils/orgList.server';
import OrgList from '../components/OrgList';
import Filters from '../components/Filters';
import { pageMeta } from '../utils/meta';

export const loader = ({ request }) => loadOrgList(request, 'association');

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Associations',
    description: 'Video game related associations around you and all over the world.',
    path: location.pathname,
  });

const Associations = () => {
  const data = useLoaderData();
  const { search } = useLocation();

  return (
    <Box p={5}>
      <Filters
        type="association"
        facets={data.facets}
        selected={data.selected}
      />
      <OrgList key={search} {...data} />
    </Box>
  );
};

export default Associations;
