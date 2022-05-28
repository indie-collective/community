import { Link, useFetcher } from '@remix-run/react';
import { Link as ChakraLink, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';

import useDebounce from '../hooks/useDebounce';

const PossibleGameDuplicates = ({ value, ignoredId }) => {
  const games = useFetcher();

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (value.length > 2) {
      const variables = { q: value };

      if (ignoredId) variables.notId = ignoredId;

      games.submit(variables, { action: '/search-game' });
    }
  }, [debouncedValue, ignoredId]);

  if (games.data?.length > 0) {
    return (
      <>
        <Text fontWeight="bold" mt={2}>
          Possible duplicates:
        </Text>
        <Text>
          {games.data.map((game, i) => (
            <Fragment key={game.id}>
              {i > 0 && ', '}
              <ChakraLink as={Link} to={`/game/${game.id}`} color="teal.500">
                {game.name}
              </ChakraLink>
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
  ignoredId: PropTypes.string,
};

export default PossibleGameDuplicates;
