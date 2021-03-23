import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';
import NextLink from 'next/link';
import { gql, useLazyQuery } from '@apollo/client';
import { Link, Text } from '@chakra-ui/react';

import useDebounce from '../hooks/useDebounce';
import usePreviousNonNullish from '../hooks/usePreviousNonNullish';

const searchOrgQuery = gql`
  query searchOrg($tokens: [EntityFilter!]!) {
    orgs: entities(filter: { and: $tokens }, first: 3) {
      nodes {
        id
        name
      }
    }
  }
`;

const PossibleOrgDuplicates = ({ value, ignoredId }) => {
  const [searchOrg, { data }] = useLazyQuery(searchOrgQuery);
  const prevData = usePreviousNonNullish(data);

  const orgData = data || prevData;

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    if (value.length > 2) {
      const tokens = value
        .split(' ')
        .filter((s) => s.length > 2)
        .map((token) => ({
          name: {
            likeInsensitive: `%${token}%`,
          },
        }));

      if (ignoredId) tokens.push({ id: { notEqualTo: ignoredId } });

      searchOrg({
        variables: {
          tokens,
        },
      });
    }
  }, [debouncedValue]);

  if (value.length > 2 && orgData && orgData.orgs.nodes.length > 0) {
    return (
      <>
        <Text fontWeight="bold" mt={2}>
          Possible duplicates:
        </Text>
        <Text>
          {orgData.orgs.nodes.map((org, i) => (
            <Fragment key={org.id}>
              {i > 0 && ', '}
              <NextLink href={`/org/${org.id}`}>
                <Link href={`/org/${org.id}`} color="teal.500">
                  {org.name}
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

PossibleOrgDuplicates.defaultProps = {
  value: '',
};

PossibleOrgDuplicates.propTypes = {
  value: PropTypes.string.isRequired,
  ignoredId: PropTypes.string,
};

export default PossibleOrgDuplicates;
