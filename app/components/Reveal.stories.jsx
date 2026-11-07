import { Box, Grid } from '@chakra-ui/react';

import Reveal from './Reveal';

export default { title: 'Motion/Reveal', component: Reveal };

// The entrance used on the homepage: a short fade and rise, staggered.
export const Staggered = {
  render: () => (
    <Grid templateColumns="repeat(4, 80px)" gap={3}>
      {Array.from({ length: 8 }, (_, i) => (
        <Reveal key={i} index={i}>
          <Box h="80px" bg="surface" borderWidth="2px" borderColor="ink" rounded="lg" />
        </Reveal>
      ))}
    </Grid>
  ),
};
