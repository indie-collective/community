import { Grid, Box } from "@chakra-ui/react";

import EventCard from "./EventCard";
import Empty from "./Empty";

const RelatedEvents = ({events}) => {
  return (
    <Grid
      mt={[2, 2, 5]}
      gap={5}
      gridTemplateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr']}
    >
      {events.length > 0 ? (
        events.map(event => (
          <Box key={event.id} minW={0}>
            <EventCard {...event} />
          </Box>
        ))
      ) : (
        <Empty gridColumn="1 / -1">No related events yet</Empty>
      )}
    </Grid>
  );
};

export default RelatedEvents;
