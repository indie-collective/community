import { Box, Grid } from '@chakra-ui/react';

import EventCard from './EventCard';
import Reveal from './Reveal';

/**
 * Events as tickets in a grid: one column, two, then three. `reveal` fades
 * them in one after the other (the homepage). `going`, when given, says
 * which events the member is going to.
 */
const EventGrid = ({ events, reveal = false, going, ...rest }) => (
  <Grid
    gap={4}
    alignItems="start"
    templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
    pt={2}
    {...rest}
  >
    {events.map((event, i) => {
      const card = <EventCard {...event} layout="grid" going={going?.(event)} />;
      return reveal ? (
        <Reveal key={event.id} index={i} minW={0}>
          {card}
        </Reveal>
      ) : (
        <Box key={event.id} minW={0}>
          {card}
        </Box>
      );
    })}
  </Grid>
);

export default EventGrid;
