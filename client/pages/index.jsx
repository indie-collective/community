import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import {
  Box,
  Text,
  Spinner,
  Heading,
  Badge,
  Stack,
} from '@chakra-ui/core';
import { format } from 'date-fns';

import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';

const query = gql`
  {
    games(last: 5, orderBy: CREATED_AT_DESC) {
      nodes {
        id
        name
        images {
          nodes {
            id
            imageFile
          }
        }
      }
    }

    entities(last: 10, orderBy: CREATED_AT_DESC) {
      nodes {
        id
        name
        type
        people {
          totalCount
        }
        games {
          totalCount
        }
      }
    }

    events(last: 10, orderBy: STARTS_AT_DESC) {
      nodes {
        id
        name
        startsAt
        endsAt
        entities {
          totalCount
        }
        games {
          totalCount
        }
        location {
          country
          city
        }
      }
    }
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(query);

  return (
    <div>
      <Navigation />

      <Box p={2} mb={5}>
        <Heading as="h3" size="md" ml={4} mt={3} mb={1}>
          Recently added games
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
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
        )}
      </Box>

      <Box p={2} mb={5}>
        <Heading as="h3" size="md" ml={4} mb={1}>
          Recently added orgs
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <Box
            p={2}
            display="grid"
            gridTemplateColumns="33% 33% 33%"
            gridColumnGap={3}
            gridRowGap={3}
          >
            {data.entities.nodes.map(({ name, type, people, games }) => (
              <Box border="1px solid silver" rounded={5} padding={2}>
                <Box d="flex" alignItems="baseline">
                  <Badge
                    rounded="full"
                    px="2"
                    variantColor="teal"
                    textAlign="right"
                  >
                    {type}
                  </Badge>
                </Box>

                <Box
                  mt="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  isTruncated
                >
                  {name}
                </Box>

                <Box
                  color="gray.500"
                  fontWeight="semibold"
                  letterSpacing="wide"
                  fontSize="xs"
                  textTransform="uppercase"
                >
                  {people.totalCount} people &bull; {games.totalCount} games
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box p={2}>
        <Heading as="h3" size="md" ml={4} mb={1}>
          Recently added events
        </Heading>
        {loading ? (
          <Spinner />
        ) : (
          <Box
            p={2}
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
              <Box>
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
                    ({ name, startsAt, endsAt, games, entities, location }) => (
                      <Box border="1px solid silver" rounded={5} padding={2}>
                        <Box
                          mt="1"
                          fontWeight="semibold"
                          as="h4"
                          lineHeight="tight"
                          isTruncated
                        >
                          {name}
                        </Box>

                        <Box
                          color="gray.500"
                          fontWeight="semibold"
                          letterSpacing="wide"
                          fontSize="xs"
                          textTransform="uppercase"
                        >
                          {games.totalCount} games &bull; {entities.totalCount}{' '}
                          orgs
                        </Box>

                        <Text>{format(Date.parse(startsAt), 'do MMM')}</Text>
                      </Box>
                    )
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </div>
  );
};

export default Home;
