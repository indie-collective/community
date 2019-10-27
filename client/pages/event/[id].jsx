import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner } from '@chakra-ui/core';
import Error from 'next/error';

import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import OrgCard from '../../components/OrgCard';

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
        nodes {
          id
          name
        }
      }

      games {
        totalCount
        nodes {
          id
          name
          images {
            nodes {
              id
            }
          }
        }
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

  if (loading) {
    return <Spinner />;
  }

  const {
    name,
    about,
    site,
    startsAt,
    endsAt,
    location,
    entities,
    games,
  } = data.event;

  return (
    <div>
      <Navigation />

      <Box mb={5}>
        <Heading>{name}</Heading>
        <Text fontSize="lg">
          <a href={site}>{site}</a>
        </Text>
        <Text fontSize="md" mt={3}>
          {about}
        </Text>
      </Box>

      <Box mb={8}>
        <Heading size="md" mb={2}>
          Games
        </Heading>
        <Box
          display="grid"
          gridTemplateColumns="33% 33% 33%"
          gridColumnGap={3}
          gridRowGap={3}
        >
          {games.nodes.map(({ id, name, images }) => (
            <GameCard key={id} id={id} name={name} images={images.nodes} />
          ))}
        </Box>
      </Box>

      <Box>
        <Heading size="md" mb={2}>
          Orgs
        </Heading>
        <Box
          display="grid"
          gridTemplateColumns="33% 33% 33%"
          gridColumnGap={3}
          gridRowGap={3}
        >
          {entities.nodes.map(({ id, name, images }) => (
            <OrgCard key={id} id={id} name={name} images={images.nodes} />
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default Event;
