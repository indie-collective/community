import { Link, useFetcher } from '@remix-run/react';
import { Link as ChakraLink, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';

import useDebounce from '../hooks/useDebounce';

const PossibleOrgDuplicates = ({ value, ignoredId }) => {
  const orgs = useFetcher();

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (value.length > 2) {
      const variables = { q: value };

      if (ignoredId) variables.notId = ignoredId;

      orgs.submit(variables, { action: '/search-org' });
    }
  }, [debouncedValue, ignoredId]);

  if (orgs.data?.length > 0) {
    return (
      <>
        <Text fontWeight="bold" mt={2}>
          Possible duplicates:
        </Text>
        <Text>
          {orgs.data.map((org, i) => (
            <Fragment key={org.id}>
              {i > 0 && ', '}
              <ChakraLink as={Link} to={`/org/${org.id}`} color="teal.500">
                {org.name}
              </ChakraLink>
            </Fragment>
          ))}
        </Text>
      </>
    );
  }

  return null;
};

PossibleOrgDuplicates.defaultProps = {
  value: '',
};

PossibleOrgDuplicates.propTypes = {
  value: PropTypes.string.isRequired,
  ignoredId: PropTypes.string,
};

export default PossibleOrgDuplicates;
