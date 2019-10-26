import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Spinner, Stack } from '@chakra-ui/core';

import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';

const gamesQuery = gql`
  {
    games(first: 10) {
      nodes {
        id
        name
        about
        site

        images {
          nodes {
            id
            imageFile
          }
        }
      }
    }
  }
`;

export default () => {
  const { loading, error, data } = useQuery(gamesQuery);

  return (
    <div>
      <Navigation />
      {loading ? (
        <Spinner />
      ) : (
        <Stack spacing={5}>
          {data.games.nodes.map(({ id, name, about, site, images }) => (
            <GameCard
              key={id}
              width="45em"
              id={id}
              name={name}
              about={about}
              site={site}
              images={images}
            />
          ))}
        </Stack>
      )}
    </div>
  );
};
