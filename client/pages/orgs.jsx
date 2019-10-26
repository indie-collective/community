import Link from 'next/link';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Spinner } from '@chakra-ui/core';

import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';

const entitiesQuery = gql`
  {
    entities(first: 100) {
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
        data.entities.nodes.map(({ id, name, type, people, games }) => (
          <OrgCard
            id={id}
            name={name}
            type={type}
            people={people}
            games={games}
          />
        ))
      )}
    </div>
  );
};
