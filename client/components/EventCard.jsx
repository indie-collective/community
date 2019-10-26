import React from 'react';
import { Box, Text } from '@chakra-ui/core';
import { format } from 'date-fns';

const EventCard = ({ name, games, entities, startsAt }) => (
  <Box border="1px solid silver" rounded={5} padding={2}>
    <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
      {name}
    </Box>

    <Box
      color="gray.500"
      fontWeight="semibold"
      letterSpacing="wide"
      fontSize="xs"
      textTransform="uppercase"
    >
      {games.totalCount} games &bull; {entities.totalCount} orgs
    </Box>

    <Text>{format(Date.parse(startsAt), 'do MMM')}</Text>
  </Box>
);

export default EventCard;
