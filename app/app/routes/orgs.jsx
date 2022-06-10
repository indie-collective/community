import { Box, Grid, Button, Fade } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Deferred, Link, useDeferred, useLoaderData } from '@remix-run/react';
import { deferred } from '@remix-run/node';

import { db } from '../utils/db.server';
import Navigation from '../components/Navigation';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';

const PAGE_SIZE = 50;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');

  const orgs = await db.entity.findMany({
      include: {
        location: true,
        logo: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: PAGE_SIZE,
    })

  const data = {
    // Removing the await enables streaming, but it seems to crash when SSR
    orgs: orgs.map((org) => ({
      ...org,
      logo: org.logo
        ? {
            url: `https://${process.env.CDN_HOST}/${org.logo.image_file.name}`,
            thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${org.logo.image_file.name}`,
          }
        : null,
    })),
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
  };
  return deferred(data);
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
  const orgs = useDeferred();

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
    <div>
      <Navigation />

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
          <Deferred
            data={orgs}
            fallback={[...new Array(PAGE_SIZE)].map((_, i) => (
              <Box key={i} minW={0}>
                <OrgCardSkeleton />
              </Box>
            ))}
          >
            <OrgsList />
          </Deferred>
        </Grid>
      </Box>
    </div>
  );
};

export default Orgs;
