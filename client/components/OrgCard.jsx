import React from 'react';
import Link from 'next/link';
import { Box, Badge } from '@chakra-ui/core';

const OrgCard = ({ id, type, name, people, games }) => (
  <Box border="1px solid silver" rounded={5} padding={2}>
    <Box d="flex" alignItems="baseline">
      <Badge rounded="full" px="2" variantColor="teal" textAlign="right">
        {type}
      </Badge>
    </Box>

    <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
      <Link href={`/org/${id}`}>{name}</Link>
    </Box>

    <Box
      color="gray.500"
      fontWeight="semibold"
      letterSpacing="wide"
      fontSize="xs"
      textTransform="uppercase"
    >
      {people.totalCount} people &bull; {games.totalCount} games
    </Box>
  </Box>
);

export default OrgCard;