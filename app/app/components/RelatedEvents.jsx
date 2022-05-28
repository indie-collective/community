import { Grid, Box, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

import EventCard from "./EventCard";

const RelatedEvents = ({events}) => {
  return (
    <Grid
      mt={[2, 2, 5]}
      gap={5}
      gridTemplateColumns={['1fr', '1fr 1fr', '1fr']}
    >
      {events.length > 0 ? (
        events.map(event => (
          <Box key={event.id} minW={0}>
            <Link key={event.id} to={`/event/${event.id}`}>
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
