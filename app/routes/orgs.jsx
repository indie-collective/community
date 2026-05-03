import { Box, Grid, Button, Presence } from '@chakra-ui/react';
import { Suspense } from 'react';
import { LuPlus } from 'react-icons/lu';
import { Link, useLoaderData } from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server'
import computeOrg from '../models/org';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';

const PAGE_SIZE = 50;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  const currentUser = await isAuthenticated(request);

  const orgs = await db.entity
    .findMany({
      include: {
        location: true,
        logo: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: PAGE_SIZE,
    })
    .then((orgs) => orgs.map(computeOrg));

  const data = {
    orgs: await Promise.all(orgs),
    currentUser,
  };

  // return deferred(data);
  return data;
};

export const meta = () => [{
  title: 'Organizations'
}, {
  name: 'description',
  content: 'Video game related organizations around you and all over the world.'
}, {
  property: 'og:title',
  content: 'Organizations'
}, {
  property: 'og:description',
  content: 'Video game related organizations around you and all over the world.'
}, {
  name: 'twitter:card',
  content: 'summary'
}, {
  name: 'twitter:site',
  content: '@IndieColle'
}, {
  name: 'twitter:title',
  content: 'Organizations'
}, {
  name: 'twitter:description',
  content: 'Video game related organizations around you and all over the world.'
}];

const OrgsList = () => {
  // const orgs = useAsyncValue();
  const { orgs = [] } = useLoaderData();

  return orgs.map((org) => (
    <Box key={org.id} minW={0}>
      <Presence
        present
        animationName={{
          _open: 'fade-in',
          _closed: 'fade-out'
        }}
        animationDuration='moderate'>
        <OrgCard {...org} />
      </Presence>
    </Box>
  ));
};

const Orgs = () => {
  const { orgs, currentUser } = useLoaderData();

  return (
    <Box p={5}>
      <Grid
        gap={5}
        templateColumns={[
          '1fr',
          'repeat(2, 1fr)',
          'repeat(3, 1fr)',
          'repeat(4, 1fr)',
        ]}
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
    </Box>
  );
};

export default Orgs;
