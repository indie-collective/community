import React from 'react';
import Link from 'next/link';
import { Box, Badge } from '@chakra-ui/core';

const OrgCard = ({ id, type, name, people, games }) => (
  <Link href="/org/[id]" as={`/org/${id}`}>
    <a>
      <Box border="1px solid silver" rounded={5} padding="4px 4px 4px 8px">
        <Badge rounded="3px" px="2" variantColor="yellow" pt={1} float="right">
          {type}
        </Badge>

        <Box fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
          {name}
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
    </a>
  </Link>
);

export default OrgCard;