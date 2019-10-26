import Link from 'next/link';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner } from '@chakra-ui/core';

import Navigation from '../components/Navigation';

const eventsQuery = gql`
  {
    events(first: 10) {
      nodes {
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
  }
`;

export default () => {
  const { loading, error, data } = useQuery(eventsQuery);

  return (
    <div>
      <Navigation />
      {loading ? (
        <Spinner />
      ) : (
        data.events.nodes.map(({ id, name, about, site, startsAt, endsAt }) => (
          <tr key={id}>
            <td>
              <Box color="blue" textDecoration="underline">
                <Link href={`/event/${id}`}>{name}</Link>
              </Box>
            </td>
            <td>{about}</td>
            <td>{site}</td>
            <td>{startsAt}</td>
            <td>{endsAt}</td>
          </tr>
        ))
      )}
    </div>
  );
};
