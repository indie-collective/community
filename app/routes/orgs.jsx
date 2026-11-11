import { Box, Grid, Button } from '@chakra-ui/react';
import { Suspense } from 'react';
import { LuPlus } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import Link from '../components/Link';

import { listRecentOrganizations } from '../data/organizations.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';
import { pageMeta } from '../utils/meta';
import { Page, PageHeader } from '../components/Page';
import Reveal from '../components/Reveal';

const PAGE_SIZE = 50;

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  const orgs = await listRecentOrganizations({ limit: PAGE_SIZE });

  const data = {
    orgs,
    currentUser,
  };

  // return deferred(data);
  return data;
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Organizations',
    description:
      'Video game related organizations around you and all over the world.',
    path: location.pathname,
  });

const OrgsList = () => {
  // const orgs = useAsyncValue();
  const { orgs = [] } = useLoaderData();

  return orgs.map((org, index) => (
    <Box key={org.id} minW={0}>
      <Reveal index={index}>
        <OrgCard {...org} />
      </Reveal>
    </Box>
  ));
};

const Orgs = () => {
  const { currentUser } = useLoaderData();

  return (
    <Page>
      <PageHeader
        title="Recently added"
        description="The latest studios and associations on Community."
        actions={
          currentUser && (
            <Button asChild size="sm">
              <Link to="/orgs/create">
                <LuPlus />
                Add a studio or association
              </Link>
            </Button>
          )
        }
      />
      <Grid
        gap={2}
        templateColumns="repeat(auto-fill, minmax(220px, 1fr))"
      >
        <Suspense
          fallbackElement={[...new Array(PAGE_SIZE)].map((_, i) => (
            <Box key={i} minW={0}>
              <OrgCardSkeleton />
            </Box>
          ))}
        >
          {/* <Await resolve={orgs}> */}
          <OrgsList />
          {/* </Await> */}
        </Suspense>
      </Grid>
    </Page>
  );
};

export default Orgs;
