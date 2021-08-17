import { gql, useQuery } from '@apollo/client';
import { Box, Grid, Button, Fade } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Head from 'next/head';
import Link from 'next/link';

import useCurrentPerson from '../hooks/useCurrentPerson';
import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import OrgCard, { OrgCardSkeleton } from '../components/OrgCard';

const entitiesQuery = gql`
  ${OrgCard.fragments.org}

  query getOrgs {
    entities(orderBy: CREATED_AT_DESC, first: 100) {
      nodes {
        id
        ...OrgCardOrg
      }
    }
  }
`;

const Orgs = () => {
  const currentPerson = useCurrentPerson();
  const { loading, error, data } = useQuery(entitiesQuery);

  return (
    <div>
      <Head>
        <title>Organizations</title>
        <meta
          name="description"
          content="Video game related organizations around you and all over the world."
        />
        <meta property="og:title" content="Organizations" />
        <meta
          property="og:description"
          content="Video game related organizations around you and all over the world."
        />

        <meta name="twitter:card" content={'summary'} />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content="Organizations" />
        <meta
          name="twitter:description"
          content="Video game related organizations around you and all over the world."
        />
      </Head>

      <Navigation />

      <Box p={5}>
        {currentPerson && (
          <Box textAlign="center">
            <Link href="/orgs/create" passHref>
              <Button
                as="a"
                mb={10}
                size="lg"
                colorScheme="teal"
                leftIcon={<AddIcon />}
              >
                Add a organization
              </Button>
            </Link>
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
          {loading
            ? [...new Array(50)].map((_, i) => (
                <Box key={i} minW={0}>
                  <OrgCardSkeleton />
                </Box>
              ))
            : data.entities.nodes.map((org) => (
                <Box key={org.id} minW={0}>
                  <Fade in>
                    <OrgCard {...org} />
                  </Fade>
                </Box>
              ))}
        </Grid>
      </Box>
    </div>
  );
};

export default withApollo({ ssr: true })(Orgs);
