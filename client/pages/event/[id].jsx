import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { Spinner } from '@chakra-ui/core';
import Error from 'next/error';

import Navigation from '../../components/Navigation';

const eventQuery = gql`
  query event($id: UUID!) {
    event(id: $id) {
      id
      name
      about
      site
      startsAt
      endsAt

      location {
        id
        country
        city
        latitude
        longitude
      }

      entities {
        totalCount
      }

      games {
        totalCount
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Event = () => {
  const router = useRouter();
  const { id } = router.query;

  const validId = uuidRegex.test(id);

  const { loading, error, data } = useQuery(eventQuery, {
    variables: { id },
    skip: !validId,
  });

  if (!validId) {
    return <Error statusCode={404} />;
  }

  return (
    <div>
      <Navigation />

      <pre>{JSON.stringify(data, false, 2)}</pre>
    </div>
  );
};

export default Event;
