import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';
import NextLink from 'next/link';
import { gql, useLazyQuery } from '@apollo/client';
import { Link, Text } from '@chakra-ui/core';

import useDebounce from '../hooks/useDebounce';
import usePreviousNonNullish from '../hooks/usePreviousNonNullish';

const searchGameQuery = gql`
  query searchGame($tokens: [GameFilter!]!) {
    games(filter: { and: $tokens }, first: 3) {
      nodes {
        id
        name
      }
    }
  }
`;

const PossibleGameDuplicates = ({ value }) => {
  const [searchGame, { data }] = useLazyQuery(searchGameQuery);
  const prevData = usePreviousNonNullish(data);

  const gameData = data || prevData;

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (value.length > 2) {
      searchGame({
        variables: {
          tokens: value
            .split(' ')
            .filter((s) => s.length > 2)
            .map((token) => ({
              name: {
                likeInsensitive: `%${token}%`,
              },
            })),
        },
      });
    }
  }, [debouncedValue]);

  if (value.length > 2 && gameData && gameData.games.nodes.length > 0) {
    return (
      <>
        <Text fontWeight="bold" mt={2}>
          Possible duplicates:
        </Text>
        <Text>
          {gameData.games.nodes.map((game, i) => (
            <Fragment key={game.id}>
              {i > 0 && ', '}
              <NextLink href={`/game/${game.id}`}>
                <Link href={`/game/${game.id}`} color="teal.500">
                  {game.name}
                </Link>
              </NextLink>
            </Fragment>
          ))}
        </Text>
      </>
    );
  }

  return null;
};

PossibleGameDuplicates.defaultProps = {
  value: '',
};

PossibleGameDuplicates.propTypes = {
  value: PropTypes.string.isRequired,
};

export default PossibleGameDuplicates;
