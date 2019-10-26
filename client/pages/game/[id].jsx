import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { Spinner } from '@chakra-ui/core';
import Error from 'next/error';

import Navigation from '../../components/Navigation';

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
          name
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

  return (
    <div>
      <Navigation />

      <pre>{JSON.stringify(data, false, 2)}</pre>
    </div>
  );
};

export default Game;
