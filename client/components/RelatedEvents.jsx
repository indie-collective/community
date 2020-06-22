import { useQuery } from "@apollo/react-hooks";
import { Spinner, Grid, Box, Text } from "@chakra-ui/core";
import gql from "graphql-tag";
import Link from "next/link";

import EventCard from "./EventCard";

const relatedEventsQuery = gql`
  ${EventCard.fragments.event}

  query getRelatedEvents($eventId: UUID, $tokens: [EventFilter!]!) {
    events(
      filter: {
        or: $tokens
        id: {
          notEqualTo: $eventId
        }
      },
      first: 5,
    ) {
      nodes {
        id
        ...EventCardEvent
      }
    }
  }
`

const RelatedEvents = ({eventId, tokens}) => {
  const { loading, error, data } = useQuery(relatedEventsQuery, {
    variables: {
      eventId,
      tokens: tokens.map(token => ({
        name: {
          likeInsensitive: `%${token}%`,
        },
      })),
    },
  });

  if (loading) {
    return <Spinner />
  }

  return (
    <Grid
      mt={[2, 2, 5]}
      gap={5}
      gridTemplateColumns={['1fr', '1fr 1fr', '1fr']}
    >
      {data.events.nodes.length > 0 ? (
        data.events.nodes.map(event => (
          <Box key={event.id} minW={0}>
            <Link key={event.id} href="/event/[id]" as={`/event/${event.id}`}>
              <EventCard {...event} />
            </Link>
          </Box>
        ))
      ) : (
        <Text>No related events.</Text>
      )}
    </Grid>
  );
};

export default RelatedEvents;
