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

  const associations = await db.entity
    .findMany({
      where: {
        type: 'association',
      },
      include: {
        location: true,
        logo: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: PAGE_SIZE,
    })
    .then((associations) => associations.map(computeOrg));

  const data = {
    associations: await Promise.all(associations),
    currentUser,
  };

  // return deferred(data);
  return json(data);
};

export const meta = () => ({
  title: 'Associations',
  description:
    'Video game related associations around you and all over the world.',
  'og:title': 'Associations',
  'og:description':
    'Video game related associations around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Associations',
  'twitter:description':
    'Video game related associations around you and all over the world.',
});

const OrgsList = () => {
  // const associations = useAsyncValue();
  const { associations = [] } = useLoaderData();

  return associations.map((association) => (
    <Box key={association.id} minW={0}>
      <Fade in>
        <OrgCard {...association} />
      </Fade>
    </Box>
  ));
};

const Associations = () => {
  const { association, currentUser } = useLoaderData();

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
            Add association
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
          {/* <Await resolve={associations}> */}
          <OrgsList />
          {/* </Await> */}
        </Suspense>
      </Grid>
    </Box>
  );
};

export default Associations;
