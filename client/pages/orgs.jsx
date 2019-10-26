import Link from 'next/link';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Spinner } from '@chakra-ui/core';

import Navigation from '../components/Navigation';

const entitiesQuery = gql`
  {
    entities(first: 10) {
      nodes {
        id
        name
        about
        type

        people {
          totalCount
        }

        games {
          totalCount
        }

        images {
          totalCount
        }

        events {
          totalCount
        }
      }
    }
  }
`;

export default () => {
  const { loading, error, data } = useQuery(entitiesQuery);

  return (
    <div>
      <Navigation />
      {loading ? (
        <Spinner />
      ) : (
        data.entities.nodes.map(({ id, name, about, type }) => (
          <tr key={id}>
            <td>
              <Link href={`/org/${id}`}>{name}</Link>
            </td>
            <td>{about}</td>
            <td>{type}</td>
          </tr>
        ))
      )}
    </div>
  );
};
