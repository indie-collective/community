import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { Spinner, Box, Heading, Text } from '@chakra-ui/core';
import Error from 'next/error';

import Navigation from '../../components/Navigation';
import OrgCard from '../../components/OrgCard';

const gameQuery = gql`
  query game($id: UUID!) {
    game(id: $id) {
      id
      name
      about
      site

      entities {
        totalCount
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

      tags {
        totalCount
        nodes {
          name
        }
      }

      events {
        totalCount
        nodes {
          name
        }
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Game = () => {
  const router = useRouter();
  const { id } = router.query;

  console.log(id);
  const validId = uuidRegex.test(id);

  const { loading, error, data } = useQuery(gameQuery, {
    variables: { id },
    skip: !validId,
  });

  if (!validId) {
    return <Error statusCode={404} />;
  }

  if (loading) {
    return <Spinner />;
  }

  const { name, site, about, entities } = data.game;

  return (
    <div>
      <Navigation />

      <Box mb={5} pl={5} pr={5}>
        <Heading>{name}</Heading>
        <Text fontSize="lg">
          <a href={site}>{site}</a>
        </Text>
        <Text fontSize="md" mt={3}>
          {about}
        </Text>
      </Box>

      <Box pl={5} pr={5}>
        <Heading size="md" mb={2}>
          Authors
        </Heading>
        <Box
          display="grid"
          gridTemplateColumns="33% 33% 33%"
          gridColumnGap={3}
          gridRowGap={3}
        >
          {entities.nodes.map(({ id, name, type, people, games }) => (
            <OrgCard
              id={id}
              name={name}
              type={type}
              people={people}
              games={games}
            />
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default Game;
