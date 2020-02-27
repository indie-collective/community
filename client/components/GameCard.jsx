import Link from 'next/link';
import { Box, Image, Text } from '@chakra-ui/core';

import usePlaceholder from '../hooks/usePlaceholder';

const GameCard = ({ id, images, name }) => {
  const placeholder = usePlaceholder();

  return (
    <Box p={1} borderWidth="1px" flex="1" rounded="md">
      <Image
        src={images.length > 0 && images[0].thumbnail_url}
        fallbackSrc={placeholder}
        objectFit="cover"
        minWidth="100%"
        rounded="md"
      />

      <Box p={2} pb={1} grid>
        <Link href="/game/[id]" as={`/game/${id}`}>
          <a>{name}</a>
        </Link>
      </Box>
    </Box>
  );
};

export default GameCard;
