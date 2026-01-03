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
import Filters from '../components/Filters';

const PAGE_SIZE = 50;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const country = searchParams.get('country');
  const has_games = searchParams.get('has_games');
  const has_events = searchParams.get('has_events');

  const currentUser = await authenticator.isAuthenticated(request);

  const where = {
    type: 'studio',
  };

  if (country) {
    where.location = {
      country_code: country,
    };
  }

  if (has_games === 'on') {
    where.game_entity = {
      some: {},
    };
  }

  if (has_events === 'on') {
    where.entity_event = {
      some: {},
    };
  }

  const studios = await db.entity
    .findMany({
      where,
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

  const countries = await db.location.groupBy({
    by: ['country_code'],
    where: {
      entity: {
        some: {
          type: 'studio',
        },
      },
    },
    _count: true,
    orderBy: {
      _count: {
        country_code: 'desc',
      },
    },
  });

  const data = {
    studios: await Promise.all(studios),
    facets: {
      countries,
    },
    selected: {
      country,
      has_games,
      has_events,
    },
    currentUser,
  };

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
  const data = useLoaderData();

  return (
    <Box p={5}>
      <Filters
        facets={data.facets}
        selected={data.selected}
      />
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
          <OrgsList />
        </Suspense>
      </Grid>
    </Box>
  );
};

export default Studios;
