import { Box, Grid, Button, Fade } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Suspense } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeOrg from '../models/org';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';

const PAGE_SIZE = 50;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  const currentUser = await authenticator.isAuthenticated(request);

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
  return json(data);
};

export const meta = () => ({
  title: 'Organizations',
  description:
    'Video game related organizations around you and all over the world.',
  'og:title': 'Organizations',
  'og:description':
    'Video game related organizations around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Organizations',
  'twitter:description':
    'Video game related organizations around you and all over the world.',
});

const OrgsList = () => {
  // const orgs = useAsyncValue();
  const { orgs = [] } = useLoaderData();

  return orgs.map((org) => (
    <Box key={org.id} minW={0}>
      <Fade in>
        <OrgCard {...org} />
      </Fade>
    </Box>
  ));
};

const Orgs = () => {
  const { orgs, currentUser } = useLoaderData();

  return (
    <Box p={5}>
      {currentUser && (
        <Box textAlign="center">
          <Button
            as={Link}
            to="/orgs/create"
            mb={10}
            size="lg"
            colorScheme="teal"
            leftIcon={<AddIcon />}
          >
            Add a organization
          </Button>
        </Box>
      )}

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
