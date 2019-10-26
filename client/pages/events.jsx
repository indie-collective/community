import Link from 'next/link';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Box, Spinner } from '@chakra-ui/core';

import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';

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
        data.events.nodes.map(({ id, name, games, entities, location, startsAt, endsAt }) => (
          <EventCard
            key={id}
            name={name}
            startsAt={startsAt}
            endsAt={endsAt}
            games={games}
            entities={entities}
            location={location}
          />
        ))
      )}
    </div>
  );
};
