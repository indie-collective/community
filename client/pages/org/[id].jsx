import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Box, Text, Heading, Spinner } from '@chakra-ui/core';
import Error from 'next/error';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';

const orgQuery = gql`
  query org($id: UUID!) {
    entity(id: $id) {
      id
      name
      about
      type

      people {
        totalCount
      }

      games {
        totalCount
        nodes {
          id
          name
          about
          site
          images {
            nodes {
              id
            }
          }
        }
      }

      events {
        totalCount
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Org = ({id}) => {
  const validId = uuidRegex.test(id);

  const { loading, error, data } = useQuery(orgQuery, {
    variables: { id },
    skip: !validId,
  });

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const { name, about, games } = data.entity;

  return (
    <div>
      <Navigation />

      <Box mb={5} pl={5} pr={5}>
        <Heading>{name}</Heading>
        <Text fontSize="md" mt={3}>
          {about}
        </Text>
      </Box>

      <Box pl={5} pr={5}>
        <Heading size="md" mb={2}>
          Games
        </Heading>
        <Box
          display="grid"
          gridTemplateColumns="33% 33% 33%"
          gridColumnGap={3}
          gridRowGap={3}
        >
          {games.nodes.map(({ id, name, images }) => (
            <GameCard
              key={id}
              id={id}
              name={name}
              images={images.nodes}
            />
          ))}
        </Box>
      </Box>
    </div>
  );
};

Org.getInitialProps = async (context) => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ssr: true})(Org);
