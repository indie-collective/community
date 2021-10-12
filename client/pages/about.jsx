import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Heading,
  Text,
  StatGroup,
  StatLabel,
  StatNumber,
  Stat,
  SkeletonText,
} from '@chakra-ui/react';
import Head from 'next/head';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';

const aboutQuery = gql`
  query about {
    games {
      totalCount
    }

    entities {
      totalCount
    }

    events {
      totalCount
    }
  }
`;

const AboutPageSkeleton = () => (
  <Box p={5} mb={5}>
    <Box py={5} mb={10} textAlign="center">
      <Box m="auto" width={['auto', 'auto', '75%', '50%']}>
        <Heading mb={5} size="2xl">
          Find Your Community
        </Heading>

        <Text mb={5}>
          Community lets you explore indie game-focused data around the world.
          <br />
          Discover who, where and what has been / is being made near you through
          crowd-sourced data.
        </Text>

        <StatGroup my={2}>
          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>

          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>

          <Stat>
            <StatNumber>
              <SkeletonText noOfLines={1} w="30%" m="auto" skeletonHeight="2rem" p={1} />
            </StatNumber>
            <StatLabel>
              <SkeletonText noOfLines={1} w="50%" m="auto" />
            </StatLabel>
          </Stat>
        </StatGroup>
      </Box>
    </Box>
  </Box>
);

const AboutPage = () => {
  const { loading, error, data } = useQuery(aboutQuery, {
    fetchPolicy: 'cache-and-network',
  });

  if (loading) {
    return <AboutPageSkeleton />;
  }

  const { games, entities, events } = data;

  return (
    <Box p={5} mb={5}>
      <Head>
        <title>Indie Collective - Community powered video game data</title>
        <meta
          name="description"
          content="Video game related events around you and all over the world."
        />
        <meta
          property="og:title"
          content="Indie Collective - Community powered video game data"
        />
        <meta
          property="og:description"
          content="Video game related events around you and all over the world."
        />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@IndieColle" />
        <meta
          name="twitter:title"
          content="Indie Collective - Community powered video game data"
        />
        <meta
          name="twitter:description"
          content="Video game related events around you and all over the world."
        />
      </Head>

      <Box py={5} mb={10} textAlign="center">
        <Box m="auto" width={['auto', 'auto', '75%', '50%']}>
          <Heading mb={5} size="2xl">
            Find Your Community
          </Heading>

          <Text mb={5}>
            Community lets you explore indie game-focused data around the world.
            <br />
            Discover who, where and what has been / is being made near you
            through crowd-sourced data.
          </Text>

          <StatGroup my={2}>
            <Stat>
              <StatNumber>{games.totalCount}</StatNumber>
              <StatLabel>games</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{entities.totalCount}</StatNumber>
              <StatLabel>orgs</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{events.totalCount}</StatNumber>
              <StatLabel>events</StatLabel>
            </Stat>
          </StatGroup>
        </Box>
      </Box>
    </Box>
  );
};

const About = () => {
  return (
    <Box>
      <Navigation />
      <AboutPage />
    </Box>
  );
};

export default withApollo({ ssr: true })(About);
