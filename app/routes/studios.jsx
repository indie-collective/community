import {
  Box,
  Grid,
  Button,
  Fade,
  Flex,
  Heading,
  Spacer,
} from '@chakra-ui/react';
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

  const studios = await db.entity
    .findMany({
      where: {
        type: 'studio',
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
    .then((studios) => studios.map(computeOrg));

  const data = {
    studios: await Promise.all(studios),
    currentUser,
  };

  // return deferred(data);
  return json(data);
};

export const meta = () => ({
  title: 'Studios',
  description: 'Video game studios around you and all over the world.',
  'og:title': 'Studios',
  'og:description': 'Video game studios around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Studios',
  'twitter:description':
    'Video game studios around you and all over the world.',
});

const OrgsList = () => {
  // const studios = useAsyncValue();
  const { studios = [] } = useLoaderData();

  return studios.map((studio) => (
    <Box key={studio.id} minW={0}>
      <Fade in>
        <OrgCard {...studio} />
      </Fade>
    </Box>
  ));
};

const Studios = () => {
  const { studios, currentUser } = useLoaderData();

  return (
    <Box p={5}>
      <Flex minWidth="max-content" alignItems="center" gap="2" mb={6}>
        <Box p="2">
          <Heading size="2xl">Studios</Heading>
        </Box>
        <Spacer />
        {currentUser && (
          <Button
            as={Link}
            to="/orgs/create"
            colorScheme="teal"
            leftIcon={<AddIcon />}
          >
            Add studio
          </Button>
        )}
      </Flex>

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
          {/* <Await resolve={studios}> */}
          <OrgsList />
          {/* </Await> */}
        </Suspense>
      </Grid>
    </Box>
  );
};

export default Studios;
