import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner, Grid, Button } from '@chakra-ui/core';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';

const entitiesQuery = gql`
  ${OrgCard.fragments.org}

  {
    entities(first: 100) {
      nodes {
        id
        ...OrgCardOrg
      }
    }
  }
`;

const orgVariants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
};

const Orgs = () => {
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

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Spinner size="lg" />
        </Box>
      ) : (
        <Box p={5}>
          <Link href="/orgs/create">
            <Button
              display="block"
              m="auto"
              mb={10}
              size="lg"
              variantColor="teal"
              leftIcon="add"
            >
              Add a organization
            </Button>
          </Link>

          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid
              gap={5}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {data.entities.nodes.map((org) => (
                <Box key={org.id} minW={0}>
                  <motion.div variants={orgVariants}>
                    <OrgCard {...org} />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}
    </div>
  );
};

export default withApollo({ ssr: true })(Orgs);
