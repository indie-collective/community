import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner, Heading, Stack } from '@chakra-ui/core';
import Head from 'next/head';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';

import homeQuery from '../gql/homeQuery.gql';

const Home = () => {
  const { loading, error, data } = useQuery(gql(homeQuery));

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
              data.games.nodes.map(({ id, name, images }) => (
                <GameCard key={id} id={id} name={name} images={images} />
              ))}
          </Box>

          <Box
            p={2}
            display="grid"
            gridTemplateColumns="33% 33% 33%"
            gridColumnGap={3}
            gridRowGap={3}
          >
            {data.entities.nodes.map(({ id, name, type, people, games }) => (
              <OrgCard
                key={id}
                id={id}
                name={name}
                type={type}
                people={people}
                games={games}
              />
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
                  {values.map(
                    ({
                      id,
                      name,
                      cover,
                      startsAt,
                      endsAt,
                      games,
                      participants,
                      location,
                    }) => (
                      <Box key={id}>
                        <EventCard
                          key={id}
                          id={id}
                          name={name}
                          cover={cover}
                          startsAt={startsAt}
                          endsAt={endsAt}
                          games={games}
                          participants={participants}
                          location={location}
                        />
                      </Box>
                    )
                  )}
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
