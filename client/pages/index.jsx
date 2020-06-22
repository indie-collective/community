import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner, Heading, Stack } from '@chakra-ui/core';
import Head from 'next/head';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';

const homeQuery = gql`
  ${GameCard.fragments.game}
  ${OrgCard.fragments.org}
  ${EventCard.fragments.event}

  query home {
    games(last: 5, orderBy: CREATED_AT_DESC) {
      nodes {
        id
        ...GameCardGame
      }
    }

    entities(last: 10, orderBy: CREATED_AT_DESC) {
      nodes {
        id
        ...OrgCardOrg
      }
    }

    events(last: 10, orderBy: STARTS_AT_ASC) {
      nodes {
        id
        startsAt
        ...EventCardEvent
      }
    }
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(homeQuery);

  return (
    <Box pr={2}>
      <Head>
        <title>Indie Collective - Community powered video game data</title>
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
        <Box p={2} mb={5}>
          <Box
            p={2}
            display="grid"
            gridTemplateColumns="50% 50%"
            gridColumnGap={3}
            gridRowGap={3}
          >
            {!loading &&
              data.games.nodes.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
          </Box>

          <Box
            p={2}
            display="grid"
            gridTemplateColumns="33% 33% 33%"
            gridColumnGap={3}
            gridRowGap={3}
          >
            {data.entities.nodes.map((org) => (
              <OrgCard key={org.id} {...org} />
            ))}
          </Box>

          <Box
            p={2}
            pr={8}
            display="grid"
            gridTemplateColumns="25% 25% 25% 25%"
            gridColumnGap={3}
            gridRowGap={3}
          >
            {Object.entries(
              data.events.nodes.reduce((acc, event) => {
                const year = new Date(event.startsAt).getFullYear();

                if (!acc.hasOwnProperty(year)) {
                  acc[year] = [];
                }

                acc[year].push(event);

                return acc;
              }, {})
            ).map(([key, values]) => (
              <Box key={key}>
                <Heading
                  color="gray.500"
                  textAlign="center"
                  as="h3"
                  size="sm"
                  mb={2}
                  ml={1}
                >
                  {key}
                </Heading>
                <Stack spacing={2}>
                  {values.map((event) => (
                    <Box key={event.id}>
                      <EventCard {...event} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default withApollo()(Home);
