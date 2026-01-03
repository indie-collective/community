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
    type: 'association',
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

  const associations = await db.entity
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
    .then((associations) => associations.map(computeOrg));

  const countries = await db.location.groupBy({
    by: ['country_code'],
    where: {
      entity: {
        some: {
          type: 'association',
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
    associations: await Promise.all(associations),
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
  const data = useLoaderData();

  return (
    <Box p={5}>
      <Filters
        facets={data.facets}
        selected={data.selected}
        type="association"
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

export default Associations;
